from django.urls import path,include

urlpatterns = [
    path =("menu/",include("game.urls.menu.index")),
    path=("playground/",include("game.urls.playground.index")),
    path==("setting/",include("game.urls.setting.index")),
        
]
