# 🏗️ Day 06: VPC Architecture & Design — The Blueprint ⛰️📋

## 📌 Project Overview

Building in the cloud without a custom network is like building a house without a foundation.

On **Day 06**, we are designing a **Production-Grade VPC Architecture**.

We aren't just clicking "Create VPC"; we are architecting a **2-tier network** that separates:

- 🌐 Public Web Layer
- 🔒 Private Application Layer

This is the standard for security in every top-tier tech company.

---

## 🏗️ The Architecture Plan

![Architecture Diagram](./architecture.png)
The goal is to create an isolated environment where **traffic flows only where we allow it**.

---

## 🔢 Deep Dive: Understanding CIDR (Classless Inter-Domain Routing)

### ❓ What is CIDR?

CIDR is the standard method used to manage IP addresses in the cloud.

Instead of fixed "classes" of IPs, CIDR allows us to define a specific "block" of addresses using a slash notation:

- `/16`
- `/24`

### 🎯 Why is it Important?

- ⚡ **Efficiency** → Prevents wasting IP addresses
- 🧩 **Organization** → Helps divide networks into subnets
- 🚦 **Routing** → AWS uses CIDR blocks to route traffic

### 📦 The CIDR Blocks We Are Using

We are using the **Private IP Range (RFC 1918)**.

#### 🏠 VPC CIDR → `10.0.0.0/16`

- First two parts fixed → `10.0`
- Total IPs → **65,536**
- Think of it as your **Grand Plot of Land**

#### 🧱 Subnet CIDR → `10.0.1.0/24`

- First three parts fixed → `10.0.1`
- Total IPs → **256 per subnet**

⚠️ **AWS Note:**

- First 4 IPs → Reserved
- Last 1 IP → Reserved
- ✅ Usable IPs → **251**

---

## 🛡️ Security Design: The "Chain of Trust"

Instead of exposing everything, we use **Security Group Referencing**.

---

### 🌐 Web Security Group (`web-sg`)

- Allow HTTP (80) → `0.0.0.0/0` (Public)
- Allow SSH (22) → **Only Your IP**

---

### 🔒 App Security Group (`app-sg`)

- Allow SSH (22) → **ONLY from `web-sg`**

---

### 🔐 Result

Even if a hacker has your private key:

- ❌ Cannot directly access App Server
- ✅ Must go through Web Server (**Jump Box**)

---

## 🚦 Routing Logic

### 🌍 Public Subnet
