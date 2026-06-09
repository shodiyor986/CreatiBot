from . import start, create_bot, my_bots, subscription, channel_manager, admin_panel


def register_all_handlers(dp):
    """Barcha handlerlarni ro'yxatdan o'tkazish"""
    start.register_handlers(dp)
    create_bot.register_handlers(dp)
    my_bots.register_handlers(dp)
    subscription.register_handlers(dp)
    channel_manager.register_handlers(dp)
    admin_panel.register_handlers(dp)
