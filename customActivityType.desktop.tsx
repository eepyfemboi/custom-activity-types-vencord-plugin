/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 OpenAsar
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { Link } from "@components/Link";
import { definePluginSettings } from "@api/Settings";
import { Forms, React } from "@webpack/common";
import definePlugin, { OptionType } from "@utils/types";

const required_apps = {
    "1198870224104079390": 2,
}

const settings = definePluginSettings({
    custom_apps: {
        type: OptionType.STRING,
        description: "JSON-formatted string with the app ids and activity types (go to https://cocfire.xyz/page/stuff/jsonformattedstringmaker if you need help making one)",
        isValid: (value: string) => {
            try {
                JSON.parse(value);
            } catch {
                return "The value should be a valid json-formatted string. If you need help making one, "
            }
            return true;
        }
    },
});

export default definePlugin({
    name: "CustomActivityTypes",
    description: "Allows you to set custom activity types for specific app RPCs",
    authors: [{
        id: 1000729109720219778n,
        name: "SleepyFemboy",
    }],
    settings,
    patches: [
        {
            find: '.displayName="LocalActivityStore"',
            replacement: {
                match: /LOCAL_ACTIVITY_UPDATE:function\((\i)\)\{/,
                replace: "$&$self.patchActivity($1.activity);",
            }
        },
        {
            find: "}renderTimeBar(",
            replacement: {
                match: /renderTimeBar\((.{1,3})\){.{0,50}?let/,
                replace: "renderTimeBar($1){let"
            }
        }
    ],
    
    settingsAboutComponent: () => {
        return (
            <>
                <Forms.FormTitle tag="h3">
                    Custom Activity Type Plugin
                </Forms.FormTitle>
                <Forms.FormText>
                    Just a thing i made to set custom activity types for rpc things. go to <Link href="https://cocfire.xyz/page/stuff/jsonformattedstringmaker">https://cocfire.xyz/page/stuff/jsonformattedstringmaker</Link> to get a thing for it
                </Forms.FormText>
            </>
        );
    },
    patchActivity(activity: any) {
        var custom_apps = settings.store.custom_apps;
        if (custom_apps !== undefined) {
            var custom_apps_thing = JSON.parse(custom_apps);
            if (required_apps.hasOwnProperty(activity.application_id)) {
                activity.type = required_apps[activity.application_id];
            } else if (custom_apps_thing.hasOwnProperty(activity.application_id)) {
                activity.type = custom_apps_thing[activity.application_id];
            }
        }
    },
});
