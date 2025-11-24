from django.shortcuts import render
from .models import Course, Lesson

def dashboard(request):
    courses = Course.objects.all()
    return render(request, 'education/dashboard.html', {'courses': courses})
