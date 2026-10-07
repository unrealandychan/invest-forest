terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Module 1: IAM & Service Accounts
module "iam" {
  source     = "./modules/iam"
  project_id = var.project_id
}

# Module 2: Artifact Registry for Docker Images
module "artifact_registry" {
  source     = "./modules/artifact_registry"
  project_id = var.project_id
  region     = var.region
}

# Module 3: Cloud Firestore Database (Native Mode)
module "firestore" {
  source     = "./modules/firestore"
  project_id = var.project_id
  region     = var.region
}

# Module 4: Cloud Run Microservice (Market Proxy & Sync API)
module "cloud_run" {
  source                = "./modules/cloud_run"
  project_id            = var.project_id
  region                = var.region
  container_image       = var.container_image
  service_account_email = module.iam.service_account_email
  environment           = var.environment
}

# Module 5: Cloud Storage & Cloud CDN (Web Frontend Hosting)
module "storage_cdn" {
  source      = "./modules/storage_cdn"
  project_id  = var.project_id
  region      = var.region
  bucket_name = "${var.project_id}-invest-forest-web"
}
