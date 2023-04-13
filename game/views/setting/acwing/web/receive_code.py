from django.shortcuts import redirect
from django.core.cache import cache
import requests
from django.contrib.auth.models import User
from game.models.player.player import Player
from django.contrib.auth import login
from random import randint
def receive_code(request):   # 服务器端接受aciwng的授权码
    data = request.GET
    code = data.get('code')
    state = data.get('state')

    if not cache.has_key(state):
        return redirect("index")

    cache.delete(state)

    apply_access_token_url = "https://www.acwing.com/third_party/api/oauth2/access_token/"
    params = {
            'appid': "5236",
            'secret': "cfcd741a82234d898811089bf5a6d876",
            'code': code
            }
    access_token_res = requests.get(apply_access_token_url, params=params).json() # 带参访问acwing并接受授权令牌

    access_token = access_token_res['access_token']
    openid = access_token_res['openid']

    players = Player.objects.filter(openid=openid)

    if players.exists():  # 如果之前已经从acwing得到过该acwing用户的信息，则无需重新获取信息，直接使该acwing用户登录即可
        login(request, players[0].user)
        return redirect("index")

    get_userinfo_url = "https://www.acwing.com/third_party/api/meta/identity/getinfo/" 
    params = {
            "access_token": access_token,
            "openid": openid
            }
    userinfo_res = requests.get(get_userinfo_url, params=params).json() #带授权令牌访问acwing并接受授权用户信息
    
    username = userinfo_res['username']
    photo = userinfo_res['photo']
    
    while User.objects.filter(username=username).exists():  # 找到一个新用户名
       username += str(randint(0, 9))

    user = User.objects.create(username=username)
    player = Player.objects.create(user=user, photo=photo, openid=openid)

    login(request, user)

    return redirect("index")

