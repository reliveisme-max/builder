<?php
function get_registered_blocks()
{
    // Sử dụng hằng số ROOT_DIR đã định nghĩa ở config.php
    $path = ROOT_DIR . DIRECTORY_SEPARATOR . 'blocks' . DIRECTORY_SEPARATOR;

    return [
        'header-main' => [
            'title' => 'Main Header',
            'icon'  => 'fa-window-maximize',
            'file'  => $path . 'header-main.php'
        ],
        'hero-slider' => [
            'title' => 'Hero Slider',
            'icon'  => 'fa-images',
            'file'  => $path . 'hero-slider.php'
        ]
    ];
}
