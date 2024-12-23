package main

import (
	"bufio"
	"fmt"
	"log"
	"slices"
	"strings"

	resty "github.com/go-resty/resty/v2"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"

	"encoding/base64"
	"net/url"
	"os"
)

func main() {
	app := fiber.New()
	client := resty.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "https://pro.easyeda.com",
		AllowMethods: "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	err := godotenv.Load()

	var allowedDomains []string
	if err != nil {
		fmt.Println("Welcome! It seems you have not set up your .env file yet.")
		fmt.Println("Please enter a list of comma separated domain names to be whitelisted in the ALLOWED_DOMAINS environment variable.")
		fmt.Println("\nExample: waka.hackclub.com,api.wakatime.com\n")

		fmt.Print("> ")
		scanner := bufio.NewScanner(os.Stdin)
		scanner.Scan()
		err := scanner.Err()
		if err != nil {
			log.Fatal(err)
		}
		allowedDomainsScan := scanner.Text()

		envFile, err := os.Create(".env")
		if err != nil {
			log.Fatal(err)
		}

		defer envFile.Close()
		_, err = envFile.WriteString("ALLOWED_DOMAINS=" + allowedDomainsScan)
		if err != nil {
			log.Fatal(err)
		}

		fmt.Println("\nGreat - you're all set!")

		allowedDomains = strings.Split(allowedDomainsScan, ",") 
	}

	if len(allowedDomains) == 0 {
		allowedDomains = strings.Split(os.Getenv("ALLOWED_DOMAINS"), ",")
	}

	app.All("/proxy/:targeturl", func(c *fiber.Ctx) error {
		encodedURL := c.Params("targeturl")

		decodedURL, err := base64.StdEncoding.DecodeString(encodedURL)
		parsedURL, err := url.ParseRequestURI(string(decodedURL))

		if !slices.Contains(allowedDomains, parsedURL.Host) {
			return c.JSON(fiber.Map{"error": "hostname not whitelisted in ALLOWED_DOMAINS environment variable"})
		}

		if err != nil {
			return c.JSON(fiber.Map{"error": "invalid url"})
		}

		modifedHeaders := c.GetReqHeaders()
		delete(modifedHeaders, "Origin")
		delete(modifedHeaders, "Host")
		delete(modifedHeaders, "Referer")
		delete(modifedHeaders, "User-Agent")

		req := client.R().SetBody(c.Body()).SetHeaderMultiValues(modifedHeaders)

		var resp *resty.Response
		switch c.Method() {
		case fiber.MethodGet:
			resp, err = req.Get(string(decodedURL))
		case fiber.MethodPost:
			resp, err = req.Post(string(decodedURL))
		case fiber.MethodPut:
			resp, err = req.Put(string(decodedURL))
		case fiber.MethodDelete:
			resp, err = req.Delete(string(decodedURL))
		default:
			return c.JSON(fiber.Map{"error": "invalid method"})
		}

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": err.Error()})
		}

		c.Status(resp.StatusCode())
		return c.Send(resp.Body())

	})

	app.Listen(":3000")
}
