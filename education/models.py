from django.db import models

LANG_CHOICES = (
    ('en', 'English'),
    ('rw', 'Kinyarwanda'),
)

class Course(models.Model):
    title_en = models.CharField(max_length=200)
    title_rw = models.CharField(max_length=200)
    description_en = models.TextField()
    description_rw = models.TextField()

    def __str__(self):
        return self.title_en

class Lesson(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title_en = models.CharField(max_length=200)
    title_rw = models.CharField(max_length=200)
    content_en = models.TextField()
    content_rw = models.TextField()

    def __str__(self):
        return self.title_en
