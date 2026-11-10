// Vercel serverless函数格式
const mockOrders = [];

const tools = [
  {
    name: 'order_takeout',
    description: '给宝宝点外卖',
    inputSchema: {
      type: 'object',
      properties: {
        restaurant: {
          type: 'string',
          description: '餐厅名称，比如"黄焖鸡米饭"'
        },
        dishes: {
          type: 'array',
          items: { type: 'string' },
          description: '要点的菜品列表'
        },
        address: {
          type: 'string',
          description: '送达地址'
        },
        note: {
          type: 'string',
          description: '备注'
        }
      },
      required: ['restaurant', 'dishes', 'address']
    }
  },
  {
    name: 'check_orders',
    description: '查看宝宝的外卖订单',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.url || '';

  // 健康检查
  if (path === '/health' || path === '/api/health') {
    return res.status(200).json({ status: 'ok' });
  }

  // MCP工具列表
  if (path === '/mcp/v1/tools' || path === '/api/mcp/v1/tools') {
    return res.status(200).json({ tools });
  }

  // MCP工具调用
  if (path.includes('/mcp/v1/tools/') || path.includes('/api/mcp/v1/tools/')) {
    const toolName = path.split('/').pop();
    const args = req.body || {};

    if (toolName === 'order_takeout') {
      const order = {
        id: Date.now().toString(),
        restaurant: args.restaurant,
        dishes: args.dishes,
        address: args.address,
        note: args.note || '',
        time: new Date().toISOString(),
        status: '已下单'
      };
      mockOrders.push(order);
      
      return res.status(200).json({
        content: [
          {
            type: 'text',
            text: `给宝宝点好了！\n餐厅：${order.restaurant}\n菜品：${order.dishes.join('、')}\n地址：${order.address}\n订单号：${order.id}`
          }
        ]
      });
    } else if (toolName === 'check_orders') {
      const orderList = mockOrders.map(o => 
        `订单${o.id}: ${o.restaurant} - ${o.dishes.join('、')} (${o.status})`
      ).join('\n');
      
      return res.status(200).json({
        content: [
          {
            type: 'text',
            text: mockOrders.length > 0 ? `宝宝的订单：\n${orderList}` : '还没有订单哦'
          }
        ]
      });
    } else {
      return res.status(404).json({ error: '工具不存在' });
    }
  }

  return res.status(404).json({ error: 'Not Found' });
};