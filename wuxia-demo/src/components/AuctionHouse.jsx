import React, { useState, useEffect } from 'react';
import { useGameStore, getSkillInfo, TREASURES_DB } from '../store/gameState';
import { Gavel, Clock, ArrowRight, ArrowUpRight, CheckCircle2, XCircle } from 'lucide-react';

export default function AuctionHouse() {
  const player = useGameStore(state => state.player);
  const activeAuctions = useGameStore(state => state.activeAuctions);
  const auctionHistory = useGameStore(state => state.auctionHistory);
  const listAuction = useGameStore(state => state.listAuction);
  const placeBid = useGameStore(state => state.placeBid);

  const [tab, setTab] = useState('market'); // market, sell, history
  const [sellType, setSellType] = useState('skill');
  const [selectedItem, setSelectedItem] = useState('');
  const [startPrice, setStartPrice] = useState(1);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
     const timer = setInterval(() => setNow(Date.now()), 1000);
     return () => clearInterval(timer);
  }, []);

  const handleList = () => {
     if (!selectedItem || startPrice < 1) return;
     let itemToTrade = selectedItem;
     let itemName = '';

     if (sellType === 'skill') {
         const skInfo = getSkillInfo(selectedItem);
         if (!skInfo) return;
         const newDegrade = (skInfo.degradeLvl || 0) + 1;
         const baseId = selectedItem.includes('_deg') ? selectedItem.split('_deg')[0] : selectedItem;
         itemToTrade = `${baseId}_deg${newDegrade}`;
         const newSkInfo = getSkillInfo(itemToTrade);
         itemName = `《${skInfo.name.split('(')[0]}》 手抄本(劣化x${newDegrade})`;
         if(!window.confirm(`即将制作手抄本上架。\n原典：${skInfo.name}\n买家将获得：${itemName}\n起拍价：${startPrice} 银两\n确认上架？`)) return;
         
     } else if (sellType === 'treasure') {
         const t = TREASURES_DB.find(t=>t.id===selectedItem);
         if(!t) return;
         itemName = t.name;
         if(!window.confirm(`警告：上架宝具会立刻【扣除】你当前拥有的该宝具！\n起拍价：${startPrice} 银两\n确认上架？`)) return;
         
     } else if (sellType === 'points') {
         const typeMap = { 'task': '悬赏揭榜点数', 'encounter': '奇遇战点数', 'realm': '秘境下潜点数' };
         itemName = `未使用的${typeMap[selectedItem]} x1`;
         if (selectedItem === 'task' && (35 - player.taskCount) <= 0) { alert("你连1点剩余次数都没有了！"); return; }
         if (selectedItem === 'encounter' && (5 - player.encountersToday) <= 0) { alert("没有剩余奇遇次数！"); return; }
         if (selectedItem === 'realm' && (3 - player.secretRealmAttempts) <= 0) { alert("没有剩余秘境次数！"); return; }
         itemToTrade = { item: selectedItem, count: 1 };
         if(!window.confirm(`上架疲劳凭证会立即扣除今天对应的可用次数！\n起拍价：${startPrice} 银两\n确认上架？`)) return;
     }

     listAuction(sellType, itemToTrade, itemName, parseInt(startPrice, 10));
     alert("上架成功！你的拍品已进入全服竞拍席！");
     setTab('market');
  };

  const handleBid = (auction) => {
     if (auction.sellerName === player.name) {
        alert("你不能竞拍自己的物品！"); return;
     }
     const bidPrice = parseInt(window.prompt(`当前最高价：${auction.price} 银两，出价人：${auction.highestBidder || '无'}\n你想出价多少银两？\n(你的余额：${player.silver || 0})`, auction.price + 1), 10);
     if (!isNaN(bidPrice) && bidPrice > auction.price) {
         if ((player.silver || 0) < bidPrice) {
             alert("银两不足！"); return;
         }
         placeBid(auction.id, bidPrice);
     }
  };

  const formatTime = (endTime) => {
      const left = endTime - now;
      if (left <= 0) return "结算中...";
      const h = Math.floor(left / 3600000);
      const m = Math.floor((left % 3600000) / 60000);
      const s = Math.floor((left % 60000) / 1000);
      return `${h}时 ${m}分 ${s}秒`;
  };

  return (
    <div className="glass-panel animate-slide-up" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
       <h2 style={{ fontSize: '1.8rem', color: '#facc15', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
         <Gavel /> 玩家拍卖行 <span style={{fontSize: '1rem', color: 'var(--text-muted)'}}>万金散尽还复来</span>
       </h2>
       
       <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
          <button onClick={()=>setTab('market')} style={{ background: 'transparent', border: 'none', color: tab === 'market' ? '#facc15' : '#888', fontWeight: tab === 'market'?'bold':'normal', fontSize:'1.1rem', cursor: 'pointer' }}>竞拍大厅</button>
          <button onClick={()=>setTab('sell')} style={{ background: 'transparent', border: 'none', color: tab === 'sell' ? '#facc15' : '#888', fontWeight: tab === 'sell'?'bold':'normal', fontSize:'1.1rem', cursor: 'pointer' }}>上架拍卖</button>
          <button onClick={()=>setTab('history')} style={{ background: 'transparent', border: 'none', color: tab === 'history' ? '#facc15' : '#888', fontWeight: tab === 'history'?'bold':'normal', fontSize:'1.1rem', cursor: 'pointer' }}>拍卖记录</button>
          <div style={{ marginLeft: 'auto', color: '#bbb' }}>我的银两: <span style={{ color: '#fff', fontWeight: 'bold' }}>{player.silver || 0}</span></div>
       </div>

       {tab === 'market' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {activeAuctions.length === 0 ? (
               <div style={{ textAlign: 'center', color: '#555', marginTop: '4rem' }}>当前没有正在拍卖的物品。</div>
            ) : (
               activeAuctions.map(auc => (
                  <div key={auc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', border: '1px solid #444', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' }}>
                     <div>
                        <h4 style={{ color: '#fcd34d', fontSize: '1.2rem', marginBottom: '4px' }}>{auc.itemName}</h4>
                        <div style={{ fontSize: '0.85rem', color: '#888', display: 'flex', gap: '15px' }}>
                           <span>卖家: {auc.sellerName}</span>
                           <span>最新出价: <strong style={{ color: '#fff' }}>{auc.price} 银两</strong> ({auc.highestBidder || '暂无出价'})</span>
                           <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12}/> {formatTime(auc.endTime)}</span>
                        </div>
                     </div>
                     <button className="btn-primary" onClick={() => handleBid(auc)} disabled={auc.sellerName === player.name} style={{ background: auc.sellerName === player.name ? '#333' : '#b45309', padding: '0.5rem 1rem' }}>
                         竞拍
                     </button>
                  </div>
               ))
            )}
          </div>
       )}

       {tab === 'sell' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px' }}>
             <p style={{ color: '#888', fontSize: '0.9rem' }}>说明: 上架后倒计时4小时。功法卖出后买家习得的为劣化xN版，原典保留在您手中；宝具与疲劳点数上架将立刻从你身上扣除，一旦流拍则退还。</p>
             <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>类别</label>
                <select value={sellType} onChange={(e) => { setSellType(e.target.value); setSelectedItem(''); }} style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#fff', border: '1px solid #555', borderRadius:'4px' }}>
                   <option value="skill">功法手抄本 (买方劣化削弱)</option>
                   <option value="treasure">罕世宝具 (失去该宝具)</option>
                   <option value="points">今日未用疲劳点数凭证</option>
                </select>
             </div>
             
             <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>选择物品</label>
                <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#fff', border: '1px solid #555', borderRadius:'4px' }}>
                   <option value="">请选择...</option>
                   {sellType === 'skill' && player.skills.map(s => {
                       const sk = getSkillInfo(s);
                       return <option key={s} value={s}>{sk?.name}</option>;
                   })}
                   {sellType === 'treasure' && player.treasures.map(tId => {
                       const t = TREASURES_DB.find(x=>x.id===tId);
                       return <option key={tId} value={tId}>{t?.name}</option>;
                   })}
                   {sellType === 'points' && (
                       <>
                         <option value="task">悬赏揭榜点数 x1 (剩余 {Math.max(0, 35 - player.taskCount)})</option>
                         <option value="encounter">奇遇战点数 x1 (剩余 {Math.max(0, 5 - player.encountersToday)})</option>
                         <option value="realm">秘境下潜点数 x1 (剩余 {Math.max(0, 3 - player.secretRealmAttempts)})</option>
                       </>
                   )}
                </select>
             </div>
             
             <div>
                <label style={{ display: 'block', color: '#ccc', marginBottom: '0.5rem' }}>设置起拍价 (银两)</label>
                <input type="number" min="1" value={startPrice} onChange={e => setStartPrice(e.target.value)} style={{ width: '100%', padding: '0.5rem', background: '#000', color: '#fff', border: '1px solid #555', borderRadius:'4px' }} />
             </div>
             
             <button className="btn-primary" onClick={handleList} style={{ padding: '1rem', background: '#854d0e', marginTop: '1rem', fontSize: '1.1rem' }}>
                 <Gavel size={18} style={{display:'inline', marginRight:'8px', verticalAlign:'text-bottom'}} />一锤定音 · 去竞拍
             </button>
          </div>
       )}

       {tab === 'history' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {auctionHistory.length === 0 ? (
               <div style={{ textAlign: 'center', color: '#555', marginTop: '4rem' }}>暂无拍卖记录。</div>
            ) : (
               auctionHistory.map(record => {
                  const isSuccess = record.status === 'success';
                  const endDate = new Date(record.endTime);
                  const dateStr = endDate.toLocaleDateString() + ' ' + endDate.toLocaleTimeString();
                  return (
                     <div key={record.id} style={{ 
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                        background: record.sellerName === player.name || record.buyerName === player.name ? 'rgba(250, 204, 21, 0.05)' : '#111', 
                        border: '1px solid #444', borderRadius: '8px', padding: '1rem', marginBottom: '1rem' 
                     }}>
                        <div>
                           <h4 style={{ 
                              color: isSuccess ? '#fcd34d' : '#666', 
                              fontSize: '1.1rem', marginBottom: '4px',
                              display: 'flex', alignItems: 'center', gap: '6px'
                           }}>
                              {isSuccess ? <CheckCircle2 size={16} color="#fcd34d" /> : <XCircle size={16} color="#666" />}
                              {record.itemName}
                           </h4>
                           <div style={{ fontSize: '0.8rem', color: '#888', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                              <span>卖家: {record.sellerName}</span>
                              {isSuccess && <span>买家: {record.buyerName}</span>}
                              <span>成交价: <strong style={{ color: isSuccess ? '#fff' : '#666' }}>
                                 {isSuccess ? `${record.finalPrice} 银两` : '流拍'}
                              </strong></span>
                              <span style={{ color: '#555' }}>{dateStr}</span>
                           </div>
                        </div>
                        {record.sellerName === player.name && (
                           <div style={{ 
                              padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', 
                              background: 'rgba(250, 204, 21, 0.1)', color: '#fcd34d'
                           }}>
                              我是卖家
                           </div>
                        )}
                        {record.buyerName === player.name && (
                           <div style={{ 
                              padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', 
                              background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e'
                           }}>
                              我是买家
                           </div>
                        )}
                     </div>
                  );
               })
            )}
          </div>
       )}
    </div>
  );
}
