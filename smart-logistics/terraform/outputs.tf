# ==============================================================================
# Outputs
# Project: Logitrack Pro - Smart Logistics and Delivery Management System
# ==============================================================================

output "ec2_instance_id" {
  description = "The ID of the existing Logitrack Pro EC2 instance"
  value       = aws_instance.app_server.id
}

output "ec2_public_ip" {
  description = "The public IPv4 address of the EC2 instance"
  value       = aws_instance.app_server.public_ip
}

output "ec2_public_dns" {
  description = "The public DNS name assigned to the EC2 instance"
  value       = aws_instance.app_server.public_dns
}

output "security_group_id" {
  description = "The ID of the existing Security Group (launch-wizard-6)"
  value       = aws_security_group.web_sg.id
}

output "ssh_command_example" {
  description = "Convenient SSH connection command string"
  value       = "ssh -i path/to/${var.key_name}.pem ubuntu@${aws_instance.app_server.public_ip}"
}
