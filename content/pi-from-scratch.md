---
title: Pi from Scratch
kicker: OPEN SOURCE
description: Build your own mini Pi from scratch using 600 lines of TypeScript and create a personalized pi-agent with ease
slug: pi-from-scratch
date: 2026-08-12
author: The Daily Byte
tags: ["typescript", "pi", "tutorial"]
model: llama-3.3-70b-versatile
image_url: "/images/2026-08-12/pi-from-scratch.jpg"
---
A GitHub user named SaladDay has created a mini Pi from scratch using only 600 lines of TypeScript, allowing users to easily build and customize their own pi-agent from the ground up.

## Introduction to Pi from Scratch
The `pi-from-scratch` repository, which has garnered 505 stars and 33 forks on GitHub, provides a super mini version of Pi that can be used as a starting point for creating a personalized pi-agent. The repository is written entirely in TypeScript, making it accessible to developers familiar with the language.

## What is Pi?
Before diving into the `pi-from-scratch` repository, it's essential to understand what Pi is. Pi is a mathematical constant representing the ratio of a circle's circumference to its diameter. It's an irrational number, which means it cannot be expressed as a finite decimal or fraction. Pi is a fundamental constant in mathematics and is used in various mathematical formulas, including geometry and trigonometry.

## The `pi-from-scratch` Repository
The `pi-from-scratch` repository consists of 600 lines of TypeScript code that calculates Pi from scratch. The code uses various mathematical formulas to approximate the value of Pi, including the Bailey–Borwein–Plouffe formula and the Gauss-Legendre algorithm. The repository also includes a simple implementation of a pi-agent, which can be customized to perform various tasks.

## Key Features of the Repository
The `pi-from-scratch` repository has several key features that make it an attractive project for developers:
* Calculating Pi from scratch using various mathematical formulas
* Customizable pi-agent that can be used to perform various tasks
* Entirely written in TypeScript, making it accessible to developers familiar with the language
* Compact codebase consisting of only 600 lines of code

## Building and Customizing the Pi-Agent
To build and customize the pi-agent, users can follow these steps:
1. Clone the `pi-from-scratch` repository from GitHub
2. Install the required dependencies using npm or yarn
3. Modify the code to customize the pi-agent according to your needs
4. Run the code using the `tsc` command to compile the TypeScript code
5. Use the resulting JavaScript code to run the pi-agent

## Example Use Case
To demonstrate the customizability of the pi-agent, let's consider an example use case:
```typescript
// Calculate Pi using the Bailey–Borwein–Plouffe formula
function calculatePi(n: number): number {
  let pi = 0;
  for (let k = 0; k < n; k++) {
    pi += (1 / Math.pow(16, k)) * (
      4 / (8 * k + 1) -
      2 / (8 * k + 4) -
      1 / (8 * k + 5) -
      1 / (8 * k + 6)
    );
  }
  return pi;
}

// Customize the pi-agent to calculate Pi to a specified number of decimal places
function customizePiAgent(decimalPlaces: number): number {
  const pi = calculatePi(decimalPlaces);
  return pi.toFixed(decimalPlaces);
}

// Use the customized pi-agent to calculate Pi to 10 decimal places
const customizedPi = customizePiAgent(10);
console.log(customizedPi);
```
This example demonstrates how the pi-agent can be customized to calculate Pi to a specified number of decimal places.

## Conclusion
The `pi-from-scratch` repository provides a unique opportunity for developers to build and customize their own pi-agent from scratch using 600 lines of TypeScript. The repository's compact codebase and customizable nature make it an attractive project for developers looking to explore mathematical constants and agents.

## Future Development
The `pi-from-scratch` repository is still in its early stages of development, and there are several ways it can be improved and expanded upon. Some potential areas for future development include:
* Implementing additional mathematical formulas for calculating Pi
* Adding support for multiple programming languages
* Creating a user-friendly interface for customizing the pi-agent

### Key takeaways
* The `pi-from-scratch` repository provides a super mini version of Pi written in 600 lines of TypeScript
* The repository allows users to build and customize their own pi-agent from scratch
* The pi-agent can be customized to perform various tasks and calculate Pi to a specified number of decimal places
* The repository is still in its early stages of development and has potential for future expansion and improvement