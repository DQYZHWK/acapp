from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):
    async def connect(self):   #创建连接
        self.room_name = None # self（连接对象本身：类似request和resp的效果）
        
        for i in range(1000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name: # over room capacity
            return

        # 以上确定房间名称
        await self.accept()
        
        # 房间信息更新到Redis
        
        if not cache.has_key(self.room_name):
            cache.set(self.room_name,[],3600)

    
        for player in cache.get(self.room_name):
            await self.send(text_data=json.dumps({

                'event' : "create_player",
                'uuid' : player['uuid'],
                'username' : player['username'],
                'photo' : player['photo']
            }))

        await self.channel_layer.group_add(self.room_name, self.channel_name)  # django 直接将若干个连接分组，实现群发功能

    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)


    async def create_player(self, data):
        players = cache.get(self.room_name)
        players.append({
            'uuid' : data['uuid'],
            'username' : data['username'],
            'photo' : data['photo']
        })
        cache.set(self.room_name, players, 3600)
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_create_player",   # 转发到组内每一个链接
                'event' : "create_player",
                'uuid' : data['uuid'],
                'username' : data['username'],
                'photo' : data['photo'],
            }
        )
    
    async def group_create_player(self,data):
        await self.send(text_data=json.dumps(data))

    async def receive(self, text_data): # st2:server receive the request
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
