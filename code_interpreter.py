import json

class ScratchInterpreter:
    def __init__(self, scratch_code):
        self.scratch_code = json.loads(scratch_code) if isinstance(scratch_code, str) else scratch_code
        self.blocks = self.scratch_code.get('blocks', [])
    
    def interpret(self, message_text=None):
        results = []
        
        for block in self.blocks:
            block_type = block.get('type')
            
            if block_type == 'send_message':
                results.append({
                    'action': 'send_message',
                    'text': block.get('text', '')
                })
            elif block_type == 'show_buttons':
                results.append({
                    'action': 'show_buttons',
                    'buttons': block.get('buttons', [])
                })
            elif block_type == 'show_webapp':
                results.append({
                    'action': 'show_webapp',
                    'url': block.get('url', '')
                })
        
        return results

# Bot shablonlari
SCRATCH_TEMPLATES = {
    'simple_button': {
        "name": "Oddiy tugmali bot",
        "blocks": [
            {"type": "send_message", "text": "Assalomu alaykum! Men tugmali botman"},
            {"type": "show_buttons", "buttons": ["📞 Aloqa", "ℹ️ Info"]}
        ]
    },
    'message_bot': {
        "name": "Xabar yuboruvchi bot",
        "blocks": [
            {"type": "send_message", "text": "Salom! Menga xabar yuboring"}
        ]
    },
    'webapp_bot': {
        "name": "Web App bot",
        "blocks": [
            {"type": "send_message", "text": "Web App botiga xush kelibsiz!"},
            {"type": "show_webapp", "url": "https://your-webapp.com"}
        ]
    }
}
