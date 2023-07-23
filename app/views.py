from django.shortcuts import render
from django.http import JsonResponse
# Create your views here.
def index(request):
    if request.method == 'POST':
        url = request.POST.get('url')
        # Process the URL or perform any actions you need with it
        return JsonResponse({'message': 'URL received successfully'})

    return render(request, 'index.html')

