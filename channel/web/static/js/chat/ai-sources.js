// channel/web/static/js/chat/ai-sources.js

class AISources {
    constructor(element) {
        this.container = element;
        this.button = element.querySelector('.sources-toggle');
        this.panel = element.querySelector('.sources-panel');
        this.stackItems = element.querySelectorAll('.source-item-stack');
        this.isOpen = false;
        this.isHovered = false;

        this.init();
    }

    init() {
        // 1. จัดการตอน Hover (กางรูปออก)
        this.button.addEventListener('mouseenter', () => {
            this.isHovered = true;
            if (!this.isOpen) this.fanOut(true);
        });

        this.button.addEventListener('mouseleave', () => {
            this.isHovered = false;
            if (!this.isOpen) this.fanOut(false);
        });

        // 2. จัดการตอนคลิก (เปิด/ปิด Panel)
        this.button.addEventListener('click', () => {
            this.isOpen = !this.isOpen;
            this.togglePanel();
        });
    }

    fanOut(fan) {
        this.stackItems.forEach((item, index) => {
            if (index === 0) return; // รูปแรกไม่ต้องขยับ
            // ถ้ากาง: ให้ระยะห่างเป็น 3px ถ้าซ้อน: ให้ทับกัน 8px
            const margin = fan ? '3px' : '-8px';
            item.style.marginLeft = margin;
        });
    }

    togglePanel() {
        // อัปเดตไอคอนลูกศร
        const chevron = this.button.querySelector('.chevron-icon');
        if (this.isOpen) {
            chevron.style.transform = 'rotate(90deg)';
            this.fanOut(false); // เก็บรูปกลับเข้าที่
            this.panel.style.gridTemplateRows = '1fr';
            this.panel.style.opacity = '1';
            this.button.setAttribute('aria-expanded', 'true');
        } else {
            chevron.style.transform = 'rotate(0deg)';
            this.panel.style.gridTemplateRows = '0fr';
            this.panel.style.opacity = '0';
            this.button.setAttribute('aria-expanded', 'false');
        }
    }
}

// ฟังก์ชันสำหรับเรียกใช้จาก HTML (เหมือนที่ render.js ทำ)
window.renderAISources = function(sources) {
    if (!sources || sources.length === 0) return '';

    const stackLimit = 3;
    const stacked = sources.slice(0, stackLimit);
    const overflow = sources.length - stacked.length;

    // สร้างกองรูปซ้อนกัน
    const stackHtml = stacked.map((source, index) => `
        <div class="source-item-stack flex items-center justify-center w-5 h-5 rounded-full border border-gray-600 bg-gray-800 text-gray-300 overflow-hidden transition-all duration-300 ease-out" 
             style="z-index: ${stacked.length - index}; ${index !== 0 ? 'margin-left: -8px;' : ''}">
            ${source.favicon ? `<img src="${source.favicon}" class="w-full h-full object-cover" />` : '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'}
        </div>
    `).join('');

    const overflowHtml = overflow > 0 ? `<span class="ml-1 text-xs text-gray-400 tabular-nums">+${overflow}</span>` : '';

    // สร้างรายการใน Panel ที่กางออก
    const listHtml = sources.map(source => {
        let hostname = source.url;
        try { hostname = new URL(source.url).hostname.replace(/^www\./, ''); } catch(e) {}
        
        return `
            <li class="transform translate-y-2 opacity-0 transition-all duration-300" style="transition-delay: 50ms;">
                <a href="${source.url}" target="_blank" rel="noopener noreferrer" class="flex items-start gap-2.5 rounded-lg px-1 py-1.5 no-underline hover:bg-white/5 transition-colors">
                    <div class="mt-0.5 flex items-center justify-center w-5 h-5 rounded-full border border-gray-600 bg-gray-800 shrink-0">
                        ${source.favicon ? `<img src="${source.favicon}" class="w-full h-full object-cover rounded-full" />` : '<svg class="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>'}
                    </div>
                    <div class="min-w-0">
                        <div class="block truncate font-medium text-gray-200 text-sm">${source.title}</div>
                        <div class="block truncate text-gray-400 text-xs">${source.snippet || hostname}</div>
                    </div>
                </a>
            </li>
        `;
    }).join('');

    return `
        <div class="ai-sources w-full my-2" id="ai-sources-${Date.now()}">
            <button class="sources-toggle flex cursor-pointer items-center gap-2 rounded-lg py-1 text-gray-400 text-sm transition-colors hover:text-gray-200 bg-transparent border-none outline-none" aria-expanded="false" type="button">
                <div class="flex items-center">
                    ${stackHtml}
                    ${overflowHtml}
                </div>
                <span>Sources</span>
                <svg class="chevron-icon w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </button>

            <div class="sources-panel grid transition-all duration-300 ease-in-out" style="grid-template-rows: 0fr; opacity: 0;">
                <ul class="mt-1 list-none overflow-hidden pl-1">
                    ${listHtml}
                </ul>
            </div>
        </div>
    `;
};