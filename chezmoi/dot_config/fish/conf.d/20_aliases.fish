# Repeats the last command with `sudo` prefix
alias pls='sudo $history[1]'

# Needed for granted to work, see: https://docs.commonfate.io/granted/internals/shell-alias#grantedinternalsshell-alias
alias assume="source "$(dirname $(aqua which assume))"/assume.fish"

# Terraform aliases
alias tfapply='terraform apply plan.tfplan'
alias tfcopyplan='terraform show -no-color plan.tfplan | pbcopy'
alias tfplan='terraform plan -out=plan.tfplan'

# Helpers for working with Clipboard
alias pbcopy='xclip -selection clipboard'
alias pbpaste='xclip -selection clipboard -o'
alias cb='flatpak run app.getclipboard.Clipboard'

# Provision Hetzner GitLab Runners using scheduled pipelines trigger
alias gl_runner_up='glab -R el-capitano/operations/hetzner-cloud-runners schedule run 2691862'
alias gl_runner_down='glab -R el-capitano/operations/hetzner-cloud-runners schedule run 383558'
