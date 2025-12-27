<?php

namespace Modules\Header\Elements;

use Core\Block;

class Account extends Block
{
    public function getInfo()
    {
        return [
            'name' => 'Account / User',
            'icon' => 'ph-user',
            'group' => 'E-commerce'
        ];
    }

    public function render($settings = [])
    {
        return '
            <div class="flex items-center gap-2 cursor-pointer group">
                <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-gray-300 transition">
                    <i class="ph ph-user text-lg text-gray-600"></i>
                </div>
                <div class="flex flex-col leading-tight">
                    <span class="text-[10px] text-gray-500">Xin chào!</span>
                    <span class="text-xs font-bold">Đăng nhập</span>
                </div>
            </div>
        ';
    }

    public function getForm()
    {
        return '
            <div class="space-y-3">
                <div>
                    <label class="text-xs text-gray-400 block mb-1">Kiểu hiển thị</label>
                    <select class="w-full bg-gray-800 text-white p-2 rounded border border-gray-700 text-xs">
                        <option>Icon + Text</option>
                        <option>Chỉ Icon</option>
                    </select>
                </div>
            </div>
        ';
    }
}
