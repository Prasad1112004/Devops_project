# ==============================================================================
# Main Infrastructure Configuration
# Project: Logitrack Pro - Smart Logistics and Delivery Management System
# ==============================================================================

# ------------------------------------------------------------------------------
# Existing Security Group: launch-wizard-6
# Manages firewall rules for Logitrack Pro EC2 instance
# ------------------------------------------------------------------------------
resource "aws_security_group" "web_sg" {
  name        = var.security_group_name
  description = "launch-wizard-6 created 2026-11-19T15:53:55.764Z"
  vpc_id      = var.vpc_id

  # Inbound Rule 1: Secure SSH access
  # Restricted to the administrator's public IP address via variable
  ingress {
    description = "SSH access restricted to administrator IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  # Inbound Rule 2: Web access
  # Allows public incoming HTTP traffic
  ingress {
    description = "Public HTTP web traffic for Logitrack Pro"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # SECURITY NOTICE:
  # - MySQL (port 3306) is NOT exposed to the public internet.
  # - Backend API (port 5000) is NOT exposed directly to the public internet;
  #   traffic should be routed through reverse proxy (e.g., NGINX) on port 80.
  # - HTTPS (port 443) will be enabled once SSL certificates are provisioned.

  # Outbound Rule: Preserve existing rule allowing all outbound traffic (IPv4)
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = var.security_group_name
  }

  # Protection against accidental deletion
  lifecycle {
    prevent_destroy = true
  }
}

# ------------------------------------------------------------------------------
# Existing EC2 Instance: sample
# Hosting the Logitrack Pro logistics application
# ------------------------------------------------------------------------------
resource "aws_instance" "app_server" {
  ami           = var.ami_id
  instance_type = var.instance_type
  key_name      = var.key_name
  subnet_id     = var.subnet_id

  # Reference the managed security group
  vpc_security_group_ids = [aws_security_group.web_sg.id]

  # Resource Name Tag
  tags = {
    Name = var.instance_name
  }

  # NOTE ON EBS VOLUME:
  # Existing EBS Volume (vol-0960d540854588ba6) is the root volume attached
  # to this instance. It is managed implicitly as part of the instance lifecycle
  # to prevent accidental detachment or re-creation.

  # Protection against accidental termination/replacement
  lifecycle {
    prevent_destroy = true
    # Prevent unwanted replacements if minor launch attributes drift
    ignore_changes = [
      associate_public_ip_address,
      user_data
    ]
  }
}
