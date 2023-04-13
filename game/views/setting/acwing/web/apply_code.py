from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache

# 502: maybe 少包
def get_state():
    res=""
    for i in range(8):
        res = res + str(randint(0,9))
    return res

def apply_code(request):
    appid="5236"
    redirect_uri=quote("https://app5236.acapp.acwing.com.cn/setting/acwing/receive_code")  # 接受授权码的api的路由地址
    scope = "userinfo"
    state= get_state()  # 用于判断请求和回调的一致性，授权成功后后原样返回。该参数可用于防止csrf攻击（跨站请求伪造攻击）
    
    
    cache.set(state, True,7200) # 有效期2小时
    

    apply_code_url="https://www.acwing.com/third_party/api/oauth2/web/authorize/"  # 请求访问的授权第三方地址
    return JsonResponse({
        'result': "success",
        'apply_code_url':apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state)
     })
