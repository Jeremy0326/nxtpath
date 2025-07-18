from django.core.management.base import BaseCommand
from jobs.models import Job
from jobs.services.embedding_service import EmbeddingService
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = 'Generate embeddings for all jobs missing them'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Regenerate embeddings for all jobs, even if they already have them',
        )

    def handle(self, *args, **options):
        try:
            service = EmbeddingService()
            
            if options['force']:
                jobs = Job.objects.all()
                self.stdout.write(f"Regenerating embeddings for ALL {jobs.count()} jobs...")
            else:
                jobs = Job.objects.filter(embedding__isnull=True)
                self.stdout.write(f"Found {jobs.count()} jobs without embeddings.")
            
            if jobs.count() == 0:
                self.stdout.write(self.style.SUCCESS("No jobs need embedding generation."))
                return
            
            success_count = 0
            error_count = 0
            
            for job in jobs:
                try:
                    # Combine job text for embedding
                    job_text = f"{job.title}\n{job.description or ''}\n{job.requirements or ''}"
                    
                    # Generate embedding
                    embedding = service.get_embedding(job_text)
                    
                    if embedding and len(embedding) > 0:
                        job.embedding = embedding
                        job.save()
                        success_count += 1
                        self.stdout.write(f"✓ Embedded job {job.id}: {job.title[:50]}...")
                    else:
                        error_count += 1
                        self.stdout.write(
                            self.style.ERROR(f"✗ Failed to embed job {job.id}: {job.title[:50]}... (empty embedding)")
                        )
                        
                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(f"✗ Error embedding job {job.id}: {job.title[:50]}... - {str(e)}")
                    )
                    logger.exception(f"Error embedding job {job.id}")
            
            self.stdout.write("\n" + "="*50)
            self.stdout.write(self.style.SUCCESS(f"✓ Successfully embedded {success_count} jobs"))
            if error_count > 0:
                self.stdout.write(self.style.ERROR(f"✗ Failed to embed {error_count} jobs"))
            self.stdout.write("="*50)
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Command failed: {str(e)}"))
            logger.exception("Management command failed")
            raise 