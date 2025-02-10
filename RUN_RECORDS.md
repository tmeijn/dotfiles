<!-- markdownlint-disable MD024 -->
# Run Records

## Template

```plain
## <DATE>

Completion time: `<mm:ss:ms>`

### Remarks

### Possible improvements

```

## <DATE>

Completion time: `22:24.71`

### Remarks

First re-install with Ubuntu 24.10! Having the `incus` VM as a practice target definitely helped out here as I would have run into so many issues if not for that.

Really smooth, except for the Atuin step, which contained a misquoted string due to a change I made.

We can make some more impact by using `uvx` for Python packages, removing some `cargo` packages. Furthermore, I think I do not actually have to reboot anymore to make all extensions active, so we can automate much more of our scripts.

### Possible improvements

- ~~Use `uvx` for most Python packages~~
- ~~See which `cargo` packages we can remove and/or migrate to binary installations using `aqua` or `ubi`.~~
- Integrate disparate bash scripts into `chezmoi` as we do not seem to need to reboot anymore.

## 10-01-2025

Completion time: `27:05:25`

### Remarks

Actually went really smooth this time. Flatpaks and cargo installs take a really long time, but that was still 10 minutes or so. The reboot in the VM takes a really long time so certainly lost time there. Then there is the extension installation which just takes a bit of time and keeps shifting focus of the tab. Signing in to vscode opens LibreOffice Writer (WTF?!). Extension installation finally now is a good experience.

### Possible improvements

- ~~Open instructions in new window so it does not lose focus when settings up addons~~
- ~~Shorten reboot time~~
- ~~Preset `ANSIBLE_PASSWORD`~~
- ~~See if `gext` has a way to disable confirmation~~: not possible, see [issue](https://github.com/essembeh/gnome-extensions-cli/issues/13#issuecomment-1529160849)
- ~~Add instruction to explicitly sync Atuin~~
- ~~Check logins of the sites and maybe have priorities?~~: cleaned up logins, can't have priorities.
