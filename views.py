# views.py
from django.shortcuts import render

def show_map(request):
    return render(request, 'map.html', {
        'lat': 37.5665,  # 서울시청 위도
        'lng': 126.9780  # 서울시청 경도
    })

show_map()