output "project_id" {
  description = "Configured GCP project"
  value       = var.project_id
}

output "region" {
  description = "Configured GCP region"
  value       = var.region
}

output "cloud_run_service_url" {
  description = "HTTPS endpoint of the backend Cloud Run service"
  value       = module.cloud_run.service_url
}

output "web_bucket_name" {
  description = "GCS static website bucket name"
  value       = module.storage_cdn.bucket_name
}

output "web_bucket_url" {
  description = "GCS static website URL"
  value       = module.storage_cdn.bucket_url
}

output "artifact_registry_url" {
  description = "Docker repository URI for backend container pushes"
  value       = module.artifact_registry.repository_url
}

output "firestore_database_name" {
  description = "Native Firestore database resource name"
  value       = module.firestore.database_name
}

output "service_account_email" {
  description = "Service account running the Cloud Run service"
  value       = module.iam.service_account_email
}
