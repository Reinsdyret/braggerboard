CREATE TABLE participant_change (
    id UUID PRIMARY KEY,
    participant_id UUID NOT NULL REFERENCES participant (id) ON DELETE CASCADE,
    field VARCHAR(20) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    changed_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_participant_change_participant_id ON participant_change (participant_id);
