from django.shortcuts import render

def timerView(request):
    return render(request, 'testTimer.html')

