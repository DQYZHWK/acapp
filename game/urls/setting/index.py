from django.urls import path
from game.views.setting.getinfo import getinfo
from game.views.setting.login import signin
from game.views.setting.logout import signout
from game.views.setting.register import register


urlpatterns = [
    path("getinfo/", getinfo, name="setting_getinfo"),
    path("login/", signin, name="setting_login"),
    path("logout/", signout, name="setting_logout"),
    path("register/", register, name="setting_register"),
]

