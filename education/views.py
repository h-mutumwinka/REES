from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from .models import Course, Lesson


@login_required(login_url='login')
def dashboard(request):
    courses = Course.objects.all()
    return render(request, 'education/dashboard.html', {'courses': courses})


def home(request):
    return render(request, 'index.html')

def signup(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)  # log in after signup
            return redirect('dashboard')
    else:
        form = UserCreationForm()
    return render(request, 'education/signup.html', {'form': form})

