# ==============================================================================
# Variable Definitions
# Project: Logitrack Pro - Smart Logistics and Delivery Management System
# ==============================================================================

variable "aws_region" {
  description = "AWS region for the existing infrastructure"
  type        = string
  default     = "ap-south-1"
}

variable "aws_profile" {
  description = "AWS CLI named profile used for authentication"
  type        = string
  default     = "terraform"
}

variable "vpc_id" {
  description = "ID of the existing VPC"
  type        = string
  default     = "vpc-01a8f7b2a1636ff42"
}

variable "subnet_id" {
  description = "ID of the existing Subnet where the EC2 instance resides"
  type        = string
  default     = "subnet-013444dc3c677a87b"
}

variable "ami_id" {
  description = "AMI ID of the existing EC2 instance"
  type        = string
  default     = "ami-0dc0718b8dd0dedd8"
}

variable "instance_type" {
  description = "Instance type for the EC2 instance"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Existing EC2 Key Pair name for SSH access"
  type        = string
  default     = "dev2"
}

variable "security_group_name" {
  description = "Name of the existing security group"
  type        = string
  default     = "launch-wizard-6"
}

variable "instance_name" {
  description = "Name tag for the existing EC2 instance"
  type        = string
  default     = "sample"
}

variable "ssh_cidr" {
  description = "Allowed CIDR block for SSH access (port 22). Must be restricted to your public IP in CIDR format (e.g., '203.0.113.25/32')"
  type        = string
}
