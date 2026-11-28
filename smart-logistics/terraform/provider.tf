
terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket       = "logitrack-pro-terraform-state-056793557912"
    key          = "logitrack/terraform.tfstate"
    region       = "ap-south-1"
    profile      = "terraform"
    encrypt      = true
    use_lockfile = true
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}
