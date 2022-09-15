{
  programs.terminator = {
    enable = true;
    config = {
      global_config = {
        invert_search = true;
        borderless = false;
      };
      profiles.default = {
        background_color = "#002b36";
        background_darkness = 0.9;
        background_type = "transparent";
        cursor_color = "#aaaaaa";
        foreground_color = "#deddda";
        show_titlebar = false;
        scrollback_infinite = true;
        use_system_font = false;
        font = "Fira Code Regular 10";
      };
    };
  };
}
