const KEY="shop-expiration-products-v1";
const $=id=>document.getElementById(id);
let products=JSON.parse(localStorage.getItem(KEY)||"[]");

function daysLeft(date){
  const today=new Date(); today.setHours(0,0,0,0);
  const d=new Date(date+"T00:00:00");
  return Math.ceil((d-today)/86400000);
}
function status(p){
  const d=daysLeft(p.expiry);
  if(d<0) return {key:"expired",label:`Expired ${Math.abs(d)}d ago`,cls:"expired"};
  if(d<=3) return {key:"3",label:`${d} day${d===1?"":"s"} left`,cls:"dangerText"};
  if(d<=7) return {key:"7",label:`${d} days left`,cls:"soonText"};
  return {key:"ok",label:`${d} days left`,cls:"okText"};
}
function save(){localStorage.setItem(KEY,JSON.stringify(products)); render();}
function render(){
  const search=$("search").value.toLowerCase().trim(), sf=$("statusFilter").value, cf=$("categoryFilter").value;
  const cats=[...new Set(products.map(p=>p.category).filter(Boolean))].sort();
  const old=cf;
  $("categoryFilter").innerHTML='<option value="all">All categories</option>'+cats.map(c=>`<option>${escapeHtml(c)}</option>`).join("");
  if(cats.includes(old)) $("categoryFilter").value=old;
  $("allCount").textContent=products.length;
  $("expiredCount").textContent=products.filter(p=>status(p).key==="expired").length;
  $("threeCount").textContent=products.filter(p=>["expired","3"].includes(status(p).key)).length;
  $("sevenCount").textContent=products.filter(p=>["expired","3","7"].includes(status(p).key)).length;
  const filtered=products.filter(p=>{
    const s=status(p);
    return (!search || (p.name+" "+p.barcode).toLowerCase().includes(search)) &&
      (sf==="all" || s.key===sf) && (cf==="all" || p.category===cf);
  }).sort((a,b)=>a.expiry.localeCompare(b.expiry));
  $("productRows").innerHTML=filtered.map(p=>{
    const s=status(p);
    return `<tr><td><strong>${escapeHtml(p.name)}</strong><br><small>${escapeHtml(p.barcode||"")}${p.location?` · Shelf ${escapeHtml(p.location)}`:""}</small></td><td>${escapeHtml(p.category)}</td><td>${p.quantity}</td><td>${new Date(p.expiry+"T00:00:00").toLocaleDateString()}</td><td><span class="status ${s.cls}">${s.label}</span></td><td class="actions"><button onclick="editProduct('${p.id}')">✏️</button><button onclick="deleteProduct('${p.id}')">🗑️</button></td></tr>`;
  }).join("");
  $("empty").style.display=filtered.length?"none":"block";
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function openModal(p=null){
  $("modal").classList.remove("hidden"); $("modalTitle").textContent=p?"Edit product":"Add product";
  $("editId").value=p?.id||""; $("name").value=p?.name||""; $("barcode").value=p?.barcode||"";
  $("category").value=p?.category||""; $("quantity").value=p?.quantity??""; $("expiry").value=p?.expiry||"";
  $("location").value=p?.location||""; $("scanNote").textContent="";
}
function closeModal(){$("modal").classList.add("hidden")}
$("addBtn").onclick=()=>openModal(); $("closeBtn").onclick=closeModal;
$("modal").onclick=e=>{if(e.target===$("modal"))closeModal()};
$("productForm").onsubmit=e=>{
  e.preventDefault();
  const item={id:$("editId").value||crypto.randomUUID(),name:$("name").value.trim(),barcode:$("barcode").value.trim(),category:$("category").value.trim(),quantity:Number($("quantity").value),expiry:$("expiry").value,location:$("location").value.trim()};
  const i=products.findIndex(x=>x.id===item.id); if(i>=0) products[i]=item; else products.push(item);
  save(); closeModal();
};
window.editProduct=id=>openModal(products.find(p=>p.id===id));
window.deleteProduct=id=>{if(confirm("Delete this product?")){products=products.filter(p=>p.id!==id);save()}};
$("search").oninput=render; $("statusFilter").onchange=render; $("categoryFilter").onchange=render;

$("scanBtn").onclick=async()=>{
  $("scanNote").textContent="Starting camera…";
  if(!("BarcodeDetector" in window)){ $("scanNote").textContent="Barcode scanning is not supported by this browser. Enter the barcode manually."; return; }
  try{
    const detector=new BarcodeDetector();
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
    const video=document.createElement("video"); video.srcObject=stream; video.setAttribute("playsinline",""); video.style.cssText="width:100%;margin-top:10px;border-radius:10px";
    $("scanNote").replaceChildren(video); await video.play();
    const scan=async()=>{
      try{
        const codes=await detector.detect(video);
        if(codes.length){$("barcode").value=codes[0].rawValue;stream.getTracks().forEach(t=>t.stop());$("scanNote").textContent="Barcode captured.";return}
      }catch(e){}
      if(stream.active) requestAnimationFrame(scan);
    }; scan();
  }catch(e){$("scanNote").textContent="Camera permission was denied or unavailable. You can type the barcode manually."}
};

if(!products.length){
  const today=new Date(); const add=d=>{const x=new Date(today);x.setDate(x.getDate()+d);return x.toISOString().slice(0,10)};
  products=[
    {id:crypto.randomUUID(),name:"Milk 1L",barcode:"860000000001",category:"Dairy",quantity:12,expiry:add(2),location:"A1"},
    {id:crypto.randomUUID(),name:"Yogurt",barcode:"860000000002",category:"Dairy",quantity:8,expiry:add(-1),location:"A1"},
    {id:crypto.randomUUID(),name:"Coca-Cola 0.5L",barcode:"5449000000996",category:"Drinks",quantity:48,expiry:add(45),location:"B2"}
  ];
  save();
}else render();
