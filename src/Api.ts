import moment from 'moment';
const url = 'https://api.leverade.com';
const manager = '314965';
const discipline = '14';
const season = '7618';

export const categories = [
    { id: '4815', name: 'Absolut femení' },
    { id: '4814', name: 'Absolut masculí' },
    { id: '3762', name: 'Juvenil femení' },
    { id: '5877', name: 'Juvenil masculí' },
    { id: '5879', name: 'Cadet femení' },
    { id: '5878', name: 'Cadet masculí' },
    { id: '5880', name: 'Infantil femení' },
    { id: '2734', name: 'Infantil mixte' },
    { id: '5881', name: 'Aleví femení' },
    { id: '3747', name: 'Aleví mixte' },
    { id: '3744', name: 'Benjamí mixte' }
]

export type Match = {
    type: "match"
    id: string | null
    attributes: {
        date: string | null
        datetime: string | null
        display_timezone: string | null
        finished: boolean
        canceled: boolean
        postponed: boolean
        rest: boolean
        created_at: string | null
        updated_at: string | null
    },
    meta: {
        home_team: string | null
        away_team: string | null
    },
    relationships: {
        faceoff: { data: { type: "faceoff", id: string | null } | null }
        facility: { data: { type: "facility", id: string | null } | null }
        round: { data: { type: "round", id: string | null } | null }
        teams: { data: { type: "team", id: string | null }[] | null }
    }
}

export type Tournament = {
    type: "tournament"
    id: string | null
    attributes: {
        gender: string | null
        modality: string | null
        name: string | null
        order: number | null
        status: string | null
        created_at: string | null
        updated_at: string | null
    },
    relationships: {
        category: { data: { type: "category", id: string | null } | null },
        discipline: { data: { type: "discipline", id: string | null } | null },
        manager: { data: { type: "manager", id: string | null } | null },
        scoringcriterion: { data: { type: "scoringcriterion", id: string | null } | null },
        season: { data: { type: "season", id: string | null } | null }
    }
}

export type Group = {
    type: "group",
    id: string | null
    attributes: {
        name: string | null,
        order: number | null,
        type: string | null
        group: string | null,
        promote: number | null,
        relegate: number | null,
        created_at: string | null
        updated_at: string | null
    },
    relationships: {
        tournament: {
            data: {
                type: "tournament",
                id: string | null
            }
        }
    }
}

export type Facility = {
    type: "facility",
    id: string | null
    attributes: {
        active: boolean,
        latitude: number | null
        longitude: number | null
        name: string | null
        address: string | null
        postal_code: string | null
        city: string | null
        province: string | null
        phone: string | null
        created_at: string | null
        updated_at: string | null
    },
    relationships: {
        manager: {
            data: {
                type: "manager",
                id: string | null
            }
        }
    }
}

export type Round = {
    type: "round",
    id: string | null
    attributes: {
        end_date: string | null
        limit_date: null,
        name: string | null
        order: number | null
        start_date: string | null
        created_at: string | null
        updated_at: string | null
    },
    relationships: {
        group: {
            data: {
                type: "group"
                id: string | null
            }
        }
    }
}

export type Team = {
    type: "team"
    id: string | null
    attributes: {
        equipment_1: string | null
        equipment_2: string | null
        headquarter: string | null
        name: string | null
        status: string | null
        adjusted_phaseresult_value: null,
        canceled: null,
        validated: string | null
        created_at: string | null
        updated_at: string | null
    },
    meta: {
        avatar: {
            large: string | null
        }
    },
    relationships: {
        category: {
            data: null
        },
        club: {
            data: {
                type: "club"
                id: string | null
            }
        },
        registrable: {
            data: {
                type: "tournament"
                id: string | null
            }
        }
    }
}

export type Category = {
    type: "category"
    id: string
    attributes: {
        name: string
        order: number
    }
}

export type Club = {
    type: "club",
    id: string
    attributes: {
        code: string
        country: string
        info: string,
        detailed_info: string,
        email: string
        headquarter: string
        name: string
        phone: string,
        selection: boolean,
        created_at: string
        updated_at: string
    },
    relationships: {
        delegation: {
            data: {
                type: "delegation",
                id: string
            }
        }, manager: {
            data: {
                type: "manager",
                id: string
            }
        }
    }, links: {
        images: {
            image: {
                small: string
                medium: string
                large: string
            }
        }
    }
}

export type MatchResponse = {
    data: Match[],
    included: (Tournament | Group | Facility | Round | Team | Category)[]
}

export type TeamsResponse = {
    data: Team[],
    included: (Club)[]
}

export class Api {

    static async getNextMatches(category?: string, club?: string) {
        const now = moment();

        const size = '50';
        const pageNumber = '1';

        let filter = [
            `datetime>${now.format("YYYY-MM-DD")}`,
            `round.group.tournament.season.id:${season}`,
            `round.group.tournament.manager.id:${manager}`
        ];

        if (club) {
            filter.push(`teams.club.id:${club}`)
        }

        if (category) {
            filter.push(`round.group.tournament.category.id:${category}`)
        }

        let include = 'round.group.tournament,round.group.tournament.category,teams,teams,facility';
        let page = `page[size]=${size}&page[number]=${pageNumber}`

        const response = await fetch(`${url}/matches?filter=${filter.join(',')}&sort=datetime&include=${include}&${page}`);
        const data = await response.json() as MatchResponse;
        return data;
    }

    static async getClubs() {
        const page = `page[size]=250&page[number]=1`;

        let filter = [
            `club.manager.id:${manager}`,
            `registrable[tournament].discipline.id:${discipline}`,
            `registrable[tournament].season.id:${season}`
        ];

        const include = `club`;

        const response = await fetch(`${url}/teams?filter=${filter.join(',')}&include=${include}&${page}`);
        const data = await response.json() as TeamsResponse;

        const clean = (name: string) => {
            return name.replace(/^(C\.N\.|U\.E\.|C\.E\.|C\.W\.|C\.E\.F\.)\s*/, '').trim();
        };

        return (data.included as Club[]).sort((a, b) => {
            return clean(a.attributes.name).localeCompare(clean(b.attributes.name))
        });
    }
}