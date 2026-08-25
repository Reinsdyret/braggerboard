CREATE TABLE participant (
    id UUID PRIMARY KEY,
    leaderboard_id UUID NOT NULL REFERENCES leaderboard (id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    image_data BYTEA,
    image_content_type VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_participant_leaderboard_id ON participant (leaderboard_id);
