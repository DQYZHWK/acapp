from django.urls import path

from game.views.setting.acwing.web.apply_code import apply_code as web_apply_code
from game.views.setting.acwing.web.receive_code import receive_code as web_receive_code
from game.views.setting.acwing.acapp.apply_code import apply_code as acapp_apply_code
from game.views.setting.acwing.acapp.receive_code import receive_code as acapp_receive_code

urlpatterns=[ 
    path("apply_code/", web_apply_code, name="settings_acwing_web_apply_code"),
    path("receive_code/", web_receive_code, name="settings_acwing_web_receive_code"),
    path("acapp/apply_code/", acapp_apply_code, name="settings_acwing_acapp_apply_code"),
    path("acapp/receive_code/", acapp_receive_code, name="settings_acwing_acapp_receive_code"),
]

