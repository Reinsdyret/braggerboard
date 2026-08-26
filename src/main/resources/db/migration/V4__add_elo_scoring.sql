ALTER TABLE leaderboard
    ADD COLUMN scoring_mode VARCHAR(20) NOT NULL DEFAULT 'WIN_COUNT';

ALTER TABLE leaderboard
    ADD COLUMN match_format VARCHAR(20);

CREATE TABLE match (
    id UUID PRIMARY KEY,
    leaderboard_id UUID NOT NULL REFERENCES leaderboard (id) ON DELETE CASCADE,
    outcome VARCHAR(10) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_match_leaderboard_id ON match (leaderboard_id);

CREATE TABLE match_participant (
    id UUID PRIMARY KEY,
    match_id UUID NOT NULL REFERENCES match (id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participant (id) ON DELETE CASCADE,
    team VARCHAR(1) NOT NULL
);

CREATE INDEX idx_match_participant_match_id ON match_participant (match_id);
CREATE INDEX idx_match_participant_participant_id ON match_participant (participant_id);
