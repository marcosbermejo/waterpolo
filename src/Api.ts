import moment from 'moment';
const url = 'https://api.leverade.com';

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

export type MatchResponse = {
    data: Match[],
    included: (Tournament | Group | Facility | Round | Team)[]
}

export class Api {

    static async getNextMatches() {
        const now = moment();

        const season = '7618';
        const manager = '314965';
        const size = '50';
        const pageNumber = '1';

        const from = now.format("YYYY-MM-DD");
        const filter = `datetime>${from},round.group.tournament.season.id:${season},round.group.tournament.manager.id:${manager}`;
        const include = 'round.group.tournament,teams,teams,facility';
        const page = `page[size]=${size}&page[number]=${pageNumber}`

        const response = await fetch(`${url}/matches?filter=${filter}&sort=datetime&include=${include}&${page}`);
        const data = await response.json() as MatchResponse;
        return data;
    }
}