CREATE TABLE round (
    id UUID PRIMARY KEY,
    leaderboard_id UUID NOT NULL REFERENCES leaderboard (id) ON DELETE CASCADE,
    label VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_round_leaderboard_id ON round (leaderboard_id);

CREATE TABLE round_result (
    id UUID PRIMARY KEY,
    round_id UUID NOT NULL REFERENCES round (id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participant (id) ON DELETE CASCADE,
    wins INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_round_result_round_id ON round_result (round_id);
CREATE INDEX idx_round_result_participant_id ON round_result (participant_id);
