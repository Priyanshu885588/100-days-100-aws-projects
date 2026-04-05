# 🏗️ Day 06: VPC Architecture & Design — The Blueprint ⛰️📋

## 📋 Project Overview

Building in the cloud without a custom network is like building a house without a foundation.

On Day 06, we are designing a **Production-Grade VPC Architecture**.

We aren't just clicking "Create VPC"; we are architecting a **2-tier network** that separates our **Public Web Layer** from our **Private Application Layer**.

This is the standard for security in every top-tier tech company.

---

## 🏗️ The Architecture Plan

The goal is to create an isolated environment where traffic flows only where we allow it.

### 🔧 Network Components:

- **VPC (The Perimeter):** A custom `10.0.0.0/16` network
- **Public Subnet (Tier 1):** The "Front Door" for our Web Servers
- **Private Subnet (Tier 2):** The "Vault" for our Application/Database servers
- **Internet Gateway (IGW):** The bridge between our VPC and the Public Internet
- **Route Tables:** The "Traffic Police" that decide where data packets go

---

## 🔢 Deep Dive: Understanding CIDR & Subnetting

To build a network, you must understand the math behind the addresses.

### 📊 CIDR Breakdown

| Component      | CIDR Block  | Total IPs | Purpose                      |
| -------------- | ----------- | --------- | ---------------------------- |
| VPC            | 10.0.0.0/16 | 65,536    | The entire network range     |
| Public Subnet  | 10.0.1.0/24 | 256       | High-exposure web resources  |
| Private Subnet | 10.0.2.0/24 | 256       | Sensitive internal resources |

---

### 📘 CIDR Explanation

- `/16` → First **2 octets fixed** → `10.0.x.x`
- `/24` → First **3 octets fixed** → `10.0.1.x`

---

### ⚠️ NoCap Tip

In AWS, the first **4 IP addresses** and the last **1 IP address** in every subnet are reserved by AWS for networking (DNS, Gateway, etc.).

👉 So a `/24` gives you **251 usable IPs**

---

## 🛡️ Security Design: The "Chain of Trust"

Instead of opening ports to the whole world, we use **Security Group Referencing**.

### 🌐 Web Security Group (`web-sg`)

- Inbound: Allow HTTP (80) from `0.0.0.0/0` (The World)
- Inbound: Allow SSH (22) from Only Your IP

---

### 🔒 App Security Group (`app-sg`)

- Inbound: Allow SSH (22) ONLY from `web-sg`

---

### 🔐 Result

A hacker cannot SSH into your App server even if they have the key.

They must go through the **Web Server first (Bastion Host pattern)**.

---

## 🚦 Routing Logic

### 🌍 Public Route
