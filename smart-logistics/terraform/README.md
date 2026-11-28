# Logitrack Pro – Terraform Infrastructure Management

This repository contains the Terraform configuration for managing the **EXISTING** AWS infrastructure of the **Logitrack Pro – Smart Logistics and Delivery Management System** (MCA DevOps Project).

---

## 📌 Infrastructure Summary

| Resource | Identifier / Name | Description |
| :--- | :--- | :--- |
| **AWS Region** | `ap-south-1` (Mumbai) | AWS Deployment Region |
| **AWS Profile** | `terraform` | Named profile in `~/.aws/credentials` |
| **VPC** | `vpc-01a8f7b2a1636ff42` | Existing Virtual Private Cloud |
| **Subnet** | `subnet-013444dc3c677a87b` | Existing Subnet |
| **Security Group** | `sg-0ca4301ab3cbda9d9` (`launch-wizard-6`) | Firewall rules for web & SSH |
| **EC2 Instance** | `i-0cf6d68d60bc13c1a` (`sample`) | `t3.small` instance running Logitrack Pro |
| **AMI** | `ami-0dc0718b8dd0dedd8` | Base operating system image |
| **Key Pair** | `dev2` | EC2 SSH Key Pair |
| **EBS Volume** | `vol-0960d540854588ba6` | Attached root volume (managed via instance) |

---

## 🔒 Security Configuration

- **SSH (Port 22)**: Restricted exclusively to the administrator's public IP address in CIDR notation via `var.ssh_cidr`.
- **HTTP (Port 80)**: Open to `0.0.0.0/0` to serve the web application.
- **MySQL (Port 3306)**: **Not exposed** publicly; remains internal to the host or private network.
- **Backend (Port 5000)**: **Not exposed** publicly; reverse-proxied through Port 80.
- **Accidental Deletion Protection**: `lifecycle { prevent_destroy = true }` is enabled on both the EC2 instance and Security Group.

---

## 📂 File Architecture

- `provider.tf` - Configures the AWS provider, version constraints, and the S3 remote state backend.
- `variables.tf` - Defines variables for region, profile, network IDs, AMI, and SSH CIDR.
- `main.tf` - Declares the `aws_security_group` and `aws_instance` resources with lifecycle safeguards.
- `outputs.tf` - Exposes instance ID, public IP, public DNS, and Security Group ID.
- `terraform.tfvars.example` - Template file for local variable overrides (e.g., your public IP).
- `.gitignore` - Excludes state files, local variables (`*.tfvars`), and the `.terraform` directory.

---

## 🚀 Execution Guide (PowerShell)

Follow these exact steps in order inside the `terraform` directory.

### Step 1: Prepare Variables

Create your local `terraform.tfvars` from the template:

```powershell
Copy-Item terraform.tfvars.example terraform.tfvars
```

Retrieve your current public IP address:

```powershell
(Invoke-RestMethod -Uri "https://checkip.amazonaws.com").Trim()
```

Open `terraform.tfvars` in an editor and set `ssh_cidr` with your IP followed by `/32`:
```hcl
ssh_cidr = "YOUR_ACTUAL_IP/32"
```

---

### Step 2: Initialize Terraform

Download the AWS provider plugins:

```powershell
terraform init
```

---

### Step 3: Format and Validate Configuration

Ensure syntax consistency and configuration validity:

```powershell
terraform fmt
terraform validate
```

---

### Step 4: Verify Existing Remote State

The existing EC2 instance and Security Group have already been imported into Terraform state. The state is stored remotely in the configured S3 bucket with encryption and native state locking.

Verify that both resources are present in the remote state:

```powershell
terraform state list
```

Expected resources:

```text
aws_instance.app_server
aws_security_group.web_sg
```

Do not run `terraform import` again for these resources. Do not delete or replace the existing remote state.

**Important:** Anyone using this configuration needs access to the configured AWS account, S3 state bucket, and appropriate IAM permissions.

### Step 5: Review Infrastructure Plan

Run `terraform plan` to verify that Terraform matches your existing infrastructure and that **no destructive changes or replacements** are scheduled:

```powershell
terraform plan
```

*Expected result:* Look for a message like:
`No changes. Your infrastructure matches the configuration.` or non-destructive in-place updates. Ensure **no resources are marked for recreation (`-+`) or destruction (`-`)**.

---

### Step 6: Apply Configuration (If Needed)

Only after reviewing and confirming the plan:

```powershell
terraform apply
```

---

### Step 7: View Outputs

To view the instance ID, public IP, and DNS at any time:

```powershell
terraform output
```
