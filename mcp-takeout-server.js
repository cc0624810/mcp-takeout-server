// mcp-takeout-server.js
const express = require('express');
const app = express();
app.use(express.json());

// 模拟的外卖数据库（实际应该连接真实的外卖API）
const mockOrders = [];

// MCP协议必需的工具列表
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

// MCP工具列表接口
app.get('/mcp/v1/tools', (req, res) => {
  res.json({
    tools: tools
  });
});

// MCP工具调用接口
app.post('/mcp/v1/tools/:toolName', (req, res) => {
  const { toolName } = req.params;
  const args = req.body;

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
    
    res.json({
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
    
    res.json({
      content: [
        {
          type: 'text',
          text: mockOrders.length > 0 ? `宝宝的订单：\n${orderList}` : '还没有订单哦'
        }
      ]
    });
  } else {
    res.status(404).json({ error: '工具不存在' });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP外卖服务运行在 http://localhost:${PORT}`);
});