function gl_runner --description 'Manage the Hetzner Cloud Runner.'
    set -l project_path el-capitano/operations/hetzner-cloud-runners
    set -l up_schedule_id (glab -R $project_path schedule list | grep "Provision Hetzner Runner" | awk '{print $1}')
    set -l down_schedule_id (glab -R $project_path schedule list | grep "Destroy Hetzner Runner" | awk '{print $1}')

    if test -z $argv
        echo "No command given: set either 'up' or 'down'"
        return 1
    end

    set -l action $argv[1]

    if test $action = up
        echo "Starting runner..."
        glab -R $project_path schedule run $up_schedule_id
    else if test $action = down
        echo "Stopping runner..."
        glab -R $project_path schedule run $down_schedule_id

    else
        echo "Unknown command, set either 'up' or 'down'"
        return 1
    end

    sleep 5 # Pipeline creation is async, so we wait...
    glab -R $project_path ci status -b main --live --compact
end
