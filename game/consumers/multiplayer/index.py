from channels.generic.websocket import AsyncWebsocketConsumer
import json
from django.conf import settings
from django.core.cache import cache

class MultiPlayer(AsyncWebsocketConsumer):


    async def connect(self):   #创建连接
        await self.accept()

        self.room_name = None # self（连接对象本身：类似request和resp的效果）


    async def disconnect(self, close_code):
        print('disconnect')
        await self.channel_layer.group_discard(self.room_name, self.channel_name)


    async def group_send_event(self,data):
        await self.send(text_data=json.dumps(data))



    async def create_player(self, data):
        for i in range(1000):
            name = "room-%d" % (i)
            if not cache.has_key(name) or len(cache.get(name)) < settings.ROOM_CAPACITY:
                self.room_name = name
                break

        if not self.room_name: # over room capacity
            return



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
                    'type' : "group_send_event",   # 转发到组内每一个链接,再由type所指向的函数实现由链接的服务端到客户端传
                    'event' : "create_player",
                    'uuid' : data['uuid'],
                    'username' : data['username'],
                    'photo' : data['photo'],
                }
        )

    async def attack(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event' : "attack",
                'uuid' : data['uuid'],
                'x' : data['x'],
                'y' : data['y'],
                'attackee_uuid' : data['attackee_uuid'],
                'angle' : data['angle'],
                'damage' : data['damage'],
                'ball_uuid' : data['ball_uuid'],
            }
        )
    async def shoot_fireball(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event' : "shoot_fireball",
                'uuid' : data['uuid'],
                'tx' :data['tx'],
                'ty' : data['ty'],
                'ball_uuid' : data['ball_uuid'],
            }
        )

    async def move_to(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event' : "move_to",
                'uuid' : data['uuid'],
                'tx' : data['tx'],
                'ty' : data['ty']
            }
            )
    async def flash(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type' : "group_send_event",
                'event' : "flash",
                'uuid' : data['uuid'],
                'tx' : data['tx'],
                'ty' : data['ty'],
            }
        )
    async def message(self,data):
        await self.channel_layer.group_send(
            self.room_name,
            {
                'tpye' : "group_send_event",
                'event' : "message",
                'uuid' : data['uuid'],
                'username' :data['username'],
                'text' : data['text'],

            }
        )
    async def receive(self, text_data): # st2:server receive the request
        data = json.loads(text_data)
        event = data['event']
        if event == "create_player":
            await self.create_player(data)
        elif event == "move_to":
            await self.move_to(data)
        elif event == "shoot_fireball":
            await self.shoot_fireball(data)
        elif event == "attack":
            await self.attack(data)
        elif event == "flash":
            await self.flash(data)
        elif event == "message":
            await self.message(data)

