import json
from typing import Dict, Any

connections: Dict[str, str] = {}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: WebSocket сервер для реального обмена сообщениями между пользователями
    Args: event - dict с httpMethod, body, headers
          context - object с request_id, function_name
    Returns: HTTP response dict для WebSocket подключений
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'isBase64Encoded': False,
            'body': ''
        }
    
    if method == 'GET':
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({
                'status': 'WebSocket сервер работает',
                'connections': len(connections),
                'info': 'Подключитесь через WebSocket для обмена сообщениями'
            }, ensure_ascii=False)
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        msg_type = body_data.get('type')
        
        if msg_type == 'connect' and body_data.get('userId'):
            user_id = body_data['userId']
            connection_id = context.request_id
            connections[user_id] = connection_id
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'type': 'connected',
                    'userId': user_id,
                    'connectionId': connection_id,
                    'message': 'Успешно подключено к WebSocket'
                }, ensure_ascii=False)
            }
        
        if msg_type == 'disconnect' and body_data.get('userId'):
            user_id = body_data['userId']
            if user_id in connections:
                del connections[user_id]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'type': 'disconnected',
                    'userId': user_id,
                    'message': 'Отключено от WebSocket'
                }, ensure_ascii=False)
            }
        
        if msg_type == 'message' and body_data.get('from') and body_data.get('to'):
            from_user = body_data['from']
            to_user = body_data['to']
            text = body_data.get('text', '')
            time = body_data.get('time', '')
            
            recipient_connection = connections.get(to_user)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'type': 'message_sent',
                    'from': from_user,
                    'to': to_user,
                    'text': text,
                    'time': time,
                    'delivered': bool(recipient_connection),
                    'message': 'Сообщение доставлено' if recipient_connection else 'Получатель не в сети'
                }, ensure_ascii=False)
            }
        
        if msg_type == 'status':
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'isBase64Encoded': False,
                'body': json.dumps({
                    'type': 'status_updated',
                    'status': body_data.get('status'),
                    'message': 'Статус обновлён'
                }, ensure_ascii=False)
            }
    
    return {
        'statusCode': 400,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'error': 'Неподдерживаемый метод или неверные данные'}, ensure_ascii=False)
    }
