<?php
function get_registered_blocks()
{
    $path = ROOT_DIR . DIRECTORY_SEPARATOR . 'blocks' . DIRECTORY_SEPARATOR;
    return [
        'logo'    => ['title' => 'Logo', 'icon' => 'ph-fill ph-text-aa', 'file' => $path . 'logo.php'],
        'search'  => ['title' => 'Search', 'icon' => 'ph-fill ph-magnifying-glass', 'file' => $path . 'search.php'],
        'menu'    => ['title' => 'Menu', 'icon' => 'ph-fill ph-list', 'file' => $path . 'menu.php'],
        'cart'    => ['title' => 'Cart', 'icon' => 'ph-fill ph-shopping-cart-simple', 'file' => $path . 'cart.php'],
        'button'  => ['title' => 'Button', 'icon' => 'ph-fill ph-rectangle', 'file' => $path . 'button.php'],
    ];
}
