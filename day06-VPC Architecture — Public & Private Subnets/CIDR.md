# 📘 CIDR Cheat Sheet — `10.0.0.0/16`

---

## 🧠 What is CIDR?

**CIDR** (Classless Inter-Domain Routing) defines how IP ranges are structured.

**Format:**

```
IP_ADDRESS / PREFIX_LENGTH
```

**Example:**

```
10.0.0.0 / 16
```

---

## 🔢 CIDR Breakdown Table

| CIDR  | Use Case            | Fixed Bits | Host Bits | Total IPs |
| ----- | ------------------- | ---------- | --------- | --------- |
| `/16` | Large Network (VPC) | 16         | 16        | 65,536    |
| `/24` | Subnet              | 24         | 8         | 256       |
| `/28` | Small Subnet        | 28         | 4         | 16        |
| `/32` | Single Host         | 32         | 0         | 1         |

> 📌 **Rule:** Higher prefix = Smaller network. Lower prefix = Bigger network.

---

## 🌐 `10.0.0.0/16` — VPC Level

- **Range:** `10.0.0.0` → `10.0.255.255`
- **Total IPs:** 65,536

### 🧩 Structure

```
10  .  0  .  X  .  X
↑↑↑↑↑↑↑↑↑↑    ↑↑↑↑↑↑↑↑
 FIXED (16 bits)   VARIABLE (hosts)
```

### ▶️ First 10 IPs

```
10.0.0.0
10.0.0.1
10.0.0.2
10.0.0.3
10.0.0.4
10.0.0.5
10.0.0.6
10.0.0.7
10.0.0.8
10.0.0.9
```

### ⏪ Last 10 IPs

```
10.0.255.246
10.0.255.247
10.0.255.248
10.0.255.249
10.0.255.250
10.0.255.251
10.0.255.252
10.0.255.253
10.0.255.254
10.0.255.255
```

---

## 🧱 Subnets Inside `/16`

A `/16` VPC can be divided into **256 subnets** of `/24` each.

```
VPC → 10.0.0.0/16
├── 10.0.0.0/24   (Subnet 1)
├── 10.0.1.0/24   (Subnet 2 — Public)
├── 10.0.2.0/24   (Subnet 3 — Private)
├── 10.0.3.0/24   (Subnet 4)
└── ... up to 10.0.255.0/24
```

---

## 🌍 `10.0.1.0/24` — Public Subnet

- **Range:** `10.0.1.0` → `10.0.1.255`
- **Total IPs:** 256
- **Usable IPs (after AWS reserved):** 251

### ▶️ First 10 IPs

```
10.0.1.0
10.0.1.1
10.0.1.2
10.0.1.3
10.0.1.4
10.0.1.5
10.0.1.6
10.0.1.7
10.0.1.8
10.0.1.9
```

### ⏪ Last 10 IPs

```
10.0.1.246
10.0.1.247
10.0.1.248
10.0.1.249
10.0.1.250
10.0.1.251
10.0.1.252
10.0.1.253
10.0.1.254
10.0.1.255
```

---

## 🔒 `10.0.2.0/24` — Private Subnet

- **Range:** `10.0.2.0` → `10.0.2.255`
- **Total IPs:** 256
- **Usable IPs (after AWS reserved):** 251

### ▶️ First 10 IPs

```
10.0.2.0
10.0.2.1
10.0.2.2
10.0.2.3
10.0.2.4
10.0.2.5
10.0.2.6
10.0.2.7
10.0.2.8
10.0.2.9
```

### ⏪ Last 10 IPs

```
10.0.2.246
10.0.2.247
10.0.2.248
10.0.2.249
10.0.2.250
10.0.2.251
10.0.2.252
10.0.2.253
10.0.2.254
10.0.2.255
```

---

## ⚠️ AWS Reserved IPs — VERY IMPORTANT

AWS **reserves 5 IPs** in every subnet. You cannot assign these to EC2 instances.

| Position | IP (example for `10.0.1.0/24`) | Purpose           |
| -------- | ------------------------------ | ----------------- |
| `.0`     | `10.0.1.0`                     | Network Address   |
| `.1`     | `10.0.1.1`                     | AWS — VPC Router  |
| `.2`     | `10.0.1.2`                     | AWS — DNS Server  |
| `.3`     | `10.0.1.3`                     | AWS — Future Use  |
| `.255`   | `10.0.1.255`                   | Broadcast Address |

✅ **Usable range:**

```
10.0.1.4  →  10.0.1.254   (251 usable IPs)
```

> 💡 This is why AWS says a `/24` gives you **251** usable IPs, not 256.

---

## ⚔️ Key Concepts — Interview Gold

| Concept                          | Answer                                                        |
| -------------------------------- | ------------------------------------------------------------- |
| What does `/16` mean?            | First 16 bits are fixed (network), remaining 16 are for hosts |
| How many IPs in `/16`?           | 2^16 = **65,536**                                             |
| How many IPs in `/24`?           | 2^8 = **256**                                                 |
| How many usable in `/24` on AWS? | **251** (5 reserved by AWS)                                   |
| VPC CIDR range?                  | Usually `/16`                                                 |
| Subnet CIDR range?               | Usually `/24`                                                 |
| Higher prefix = ?                | Smaller network                                               |
| Lower prefix = ?                 | Bigger network                                                |

---

## 🧠 Easy Analogy

```
/16  →  🏙️  City       (10.0.0.0/16   — the whole VPC)
/24  →  🏢  Building   (10.0.1.0/24   — a subnet)
/32  →  🚪  Room       (10.0.1.5/32   — a single host)
```

---

## 🚀 AWS Best Practice — Design Pattern

```
VPC
└── 10.0.0.0/16
    ├── Public Subnet  →  10.0.1.0/24   (Internet-facing, has IGW route)
    └── Private Subnet →  10.0.2.0/24   (No direct internet, uses NAT)
```

| Subnet  | CIDR          | Access                 |
| ------- | ------------- | ---------------------- |
| Public  | `10.0.1.0/24` | Internet Gateway (IGW) |
| Private | `10.0.2.0/24` | NAT Gateway only       |

---

## 🔥 Quick Formula

```
Total IPs  =  2 ^ (32 - prefix)

/16  →  2^(32-16)  =  2^16  =  65,536
/24  →  2^(32-24)  =  2^8   =  256
/28  →  2^(32-28)  =  2^4   =  16
/32  →  2^(32-32)  =  2^0   =  1
```

---

## ✅ This Covers

- ☁️ AWS Cloud Practitioner & Solutions Architect exams
- 🛠️ SRE / DevOps interviews
- 🌐 Networking fundamentals
- 🏗️ System Design — VPC architecture questions

---

> 🙌 **Star this repo** if it helped you! Feel free to share before your next interview.
