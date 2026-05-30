# CDSS Testing Harness — Setup Guide

A step-by-step guide for setting up the `cdss-testing-harness` project on Windows.

---

## Before You Begin

This guide will walk you through every step needed to get the project running on your computer. You will need to install a few programs first. **Don't skip any steps**, even if you think you may have something installed already — it's worth double-checking.

By the end of this guide you will have:

- Docker installed and running
- Node.js installed
- Git installed
- The project downloaded and ready to use

---

## Step 1 — Install Docker Desktop

Docker is a tool that runs small, self-contained software environments on your computer. The testing harness needs it to run a translation service in the background.

1. Open your web browser and go to: **https://www.docker.com/products/docker-desktop/**
2. Click the **"Download for Windows"** button.
3. Once the file downloads, open it (it will be named something like `Docker Desktop Installer.exe`).
4. Follow the on-screen installer prompts, leaving all options at their defaults. Click **Next** and then **Install**.
5. When the installer finishes, it may ask you to restart your computer. **Restart if prompted.**
6. After restarting, Docker Desktop will launch automatically. You should see the Docker whale icon appear in your system tray (bottom-right corner of your screen, near the clock).
7. Wait for Docker to finish starting up. The icon will stop animating when it is ready.

> **Note:** Docker Desktop may ask you to accept a license agreement on first launch. Click **Accept** to continue.

---

## Step 2 — Install Node.js

Node.js is the software that actually runs the testing harness. You need version **20** or higher.

1. Open your web browser and go to: **https://nodejs.org/en/**
2. Click the button labeled **"LTS"** (this stands for Long-Term Support — it is the most stable version). The version used during development was **v20.15.1**.
3. Once the file downloads, open it (named something like `node-v20.x.x-x64.msi`).
4. Follow the on-screen installer prompts, leaving all options at their defaults. Click **Next** through each screen and then **Install**.
5. When the installer finishes, click **Finish**.

### Verify Node.js installed correctly

1. Press the **Windows key**, type `cmd`, and press **Enter**. This opens the Command Prompt (a black terminal window).
2. Type the following command and press **Enter**:

```
node --version
```

3. You should see a version number printed, like `v20.15.1`. If you do, Node.js is installed correctly.

---

## Step 3 — Install Git

Git is a tool used to download ("clone") code repositories from the internet.

1. Open your web browser and go to: **https://git-scm.com/download/win**
2. The download should start automatically. If it doesn't, click the link for the **64-bit Git for Windows Setup**.
3. Once the file downloads, open it and follow the installer prompts. Leave all settings at their defaults and click **Next** through each screen, then **Install**.
4. Click **Finish** when the installer completes.

### Verify Git installed correctly

1. Open a new Command Prompt window (press **Windows key**, type `cmd`, press **Enter**).
2. Type the following and press **Enter**:

```
git --version
```

3. You should see something like `git version 2.x.x`. If you do, Git is ready to use.

---

## Step 4 — Clone the Repository

"Cloning" means downloading a copy of the project code onto your computer.

1. Open the Command Prompt (press **Windows key**, type `cmd`, press **Enter**).
2. Choose a folder where you want to save the project. For example, to save it in your Documents folder, type:

```
cd %USERPROFILE%\Documents
```

3. Press **Enter**. Your prompt should now show that you are inside your Documents folder.
4. Now clone the repository by typing the following command and pressing **Enter**:

```
git clone https://github.com/CDSS4PCP/cdss-testing-harness.git
```

5. Git will download the project. You will see lines of text scroll by. Wait for it to finish — you will know it is done when the blinking cursor returns.

---

## Step 5 — Navigate Into the Project Folder

Now you need to move into the folder that was just downloaded.

1. In the same Command Prompt window, type:

```
cd cdss-testing-harness
```

2. Press **Enter**. Your prompt should now show that you are inside the `cdss-testing-harness` folder.

---

## Step 6 — Configure the `.env` File

The project uses a `.env` file to know where your files are and how to connect to services. A default `.env` file is already included in the repository, but you should review it and update the `VSAC_API_KEY` value.

1. Open **File Explorer** and navigate to the `cdss-testing-harness` folder (it should be in your Documents folder if you followed Step 4).
2. You will see a file named **`.env`**. Open it with Notepad (right-click → **Open with** → **Notepad**).
3. The file will look like this:

```
TRANSLATION_SERVICE_URL=http://localhost:8080/cql/translator
INPUT_CQL=./test/fixtures/cql
OUTPUT_ELM=./test/fixtures/elm
VALUESETS=./test/fixtures/valuesets
PATIENTS=./test/fixtures/patients
VSAC_API_KEY=your_key
```

4. Replace `your_key` on the last line with your actual **UMLS/VSAC API key**. If you do not have one, you can register for free at **https://uts.nlm.nih.gov/uts/signup-login**.
5. Save the file and close Notepad.

> **Note:** Do not change any of the other values unless you know what you are doing — the defaults are set up to work with the project's folder structure out of the box.

---

## Step 7 — Install Project Dependencies

The project relies on several software packages that need to be downloaded before it can run.

1. Go back to your Command Prompt window (make sure you are still inside the `cdss-testing-harness` folder — your prompt should show this).
2. Type the following command and press **Enter**:

```
npm install
```

3. This may take a minute or two. You will see a lot of text scroll by as packages are downloaded. Wait for it to finish — you will know it is done when the blinking cursor returns.

> **Note:** You may see some yellow warning messages during this step. That is normal and can be ignored.

---

## Step 8 — Make Sure Docker is Running

Before running the tests, make sure Docker Desktop is open and running.

1. Look for the Docker whale icon in your system tray (bottom-right corner of your screen, near the clock).
2. If you do not see it, open Docker Desktop from the Start menu.
3. Wait for Docker to fully start up. The icon will stop animating when it is ready.

---

## Step 9 — Run the Tests

You are now ready to run the testing harness!

1. In your Command Prompt window (still inside the `cdss-testing-harness` folder), type:

```
npm run test-cql
```

2. Press **Enter**. The script will:

    - Start a translation service inside Docker
    - Translate the CQL files into a machine-readable format (ELM)
    - Run the unit tests

3. When everything completes successfully, you should see output similar to this:

```
> Starting cql-translation-service
> Waiting for server
> Translating CQL
> Running unit tests

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total

> Stopping cql-translation-service
```

---

## Troubleshooting

**"Docker is not running" error**
Make sure Docker Desktop is open and fully started before running `npm run test-cql`. Look for the whale icon in your system tray.

**"npm is not recognized" error**
Node.js did not install correctly or your terminal needs to be restarted. Close and reopen the Command Prompt, then try again.

**"git is not recognized" error**
Git did not install correctly or your terminal needs to be restarted. Close and reopen the Command Prompt, then try again.

**Errors about `VSAC_API_KEY` or gathering valuesets**
Your API key in the `.env` file is missing or incorrect. Go back to Step 6 and double-check that you replaced `your_key` with your actual VSAC API key.

**Some tests fail unexpectedly**
Some CQL rules use date ranges relative to today's date. If your system date is outside the expected range defined in a CQL file, those tests may fail. This is a known limitation noted in the project.

---

*For more information, visit the repository at https://github.com/CDSS4PCP/cdss-testing-harness*
