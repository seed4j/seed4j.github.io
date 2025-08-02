---
title: Getting Started | Guide
---

# Getting Started

## Prerequisites

### Java

You need [Java 21](https://openjdk.java.net/projects/jdk/21/).

### Node.js and npm

[Node.js](https://nodejs.org/) is required to run the development web server and build the project.  
Depending on your system, you can install Node.js from source or use a pre-built installer.

### Verify your installation

Open your terminal and run the following commands to verify that Java and Node.js are correctly installed:

```bash
java -version && javac -version
```

```bash
node -v && npm -v
```

Example output:

```
➜ java -version && javac -version
openjdk version "21.0.8" 2025-07-15
OpenJDK Runtime Environment (build 21.0.8+9-Ubuntu-0ubuntu124.04.1)
OpenJDK 64-Bit Server VM (build 21.0.8+9-Ubuntu-0ubuntu124.04.1, mixed mode, sharing)
javac 21.0.8

➜ node -v && npm -v
v22.17.1
11.5.1
```

## Quick Start

Clone the project and navigate into the directory:

```bash
git clone https://github.com/seed4j/seed4j
cd seed4j
```

Start the application:

```bash
./mvnw
```

On Windows

```bash
mvnw.cmd
```

You should see logs like:

```
----------------------------------------------------------
  Application 'seed4j' is running!
  Local: 	    http://localhost:7471/
  External: 	http://127.0.1.1:7471/
----------------------------------------------------------
```

Now open [http://localhost:7471](http://localhost:7471/) in your browser.
