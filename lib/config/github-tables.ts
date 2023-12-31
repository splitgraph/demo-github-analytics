import { useMemo } from "react";
import type { ExportTableInput } from "../../types";

/**
 * List of GitHub table names that we want to import with the Airbyte connector
 * into Splitgraph. By default, there are 163 tables available. But we only want
 * some of them, and by selecting them explicitly, the import will be much faster,
 * especially for large repositories.
 *
 * Note that Airbyte will still import tables that depend on these tables due
 * to foreign keys, and will also import airbyte metaata tables.
 */
export const relevantGitHubTableNamesForImport = `stargazers
commits
comments
pull_requests
pull_request_stats
issue_reactions`
  .split("\n")
  .filter((t) => !!t);

export const splitgraphTablesToExportToSeafowl = [
  "stargazers",
  "stargazers_user",
];

export const useTablesToExport = ({
  splitgraphNamespace,
  splitgraphRepository,
}: {
  splitgraphNamespace: string;
  splitgraphRepository: string;
}) => {
  return useMemo<ExportTableInput[]>(
    () =>
      splitgraphTablesToExportToSeafowl.map((tableName) => ({
        namespace: splitgraphNamespace,
        repository: splitgraphRepository,
        table: tableName,
      })),
    [
      splitgraphNamespace,
      splitgraphRepository,
      splitgraphTablesToExportToSeafowl,
    ]
  );
};

/**
 * List of "downstream" GitHub table names that will be imported by default by
 * the `airbyte-github` connector, given the list of `relevantGitHubTableNamesForImport`,
 * because they're either an Airbyte meta table or a table that depends on
 * one of the "relevant" tables.
 *
 * This is manually curated and might not be totally accurate. It's up to date
 * given the following list of `relevantGitHubTableNamesForImport`:
 *
 * ```
 * commits
 * comments
 * pull_requests
 * pull_request_stats
 * issue_reactions
 * ```
 */
export const expectedImportedTableNames = `_airbyte_raw_comments
_airbyte_raw_commits
_airbyte_raw_issue_reactions
_airbyte_raw_pull_request_stats
_airbyte_raw_pull_requests
_sg_ingestion_state
comments
comments_user
commits
commits_author
commits_commit
commits_commit_author
commits_commit_committer
commits_commit_tree
commits_commit_verification
commits_committer
commits_parents
issue_reactions
issue_reactions_user
pull_request_stats
pull_request_stats_merged_by
pull_requests
pull_requests__links
pull_requests__links_comments
pull_requests__links_commits
pull_requests__links_html
pull_requests__links_issue
pull_requests__links_review_comment
pull_requests__links_review_comments
pull_requests__links_self
pull_requests__links_statuses
pull_requests_assignee
pull_requests_assignees
pull_requests_auto_merge
pull_requests_auto_merge_enabled_by
pull_requests_base
pull_requests_head
pull_requests_labels
pull_requests_milestone
pull_requests_milestone_creator
pull_requests_requested_reviewers
pull_requests_requested_teams
pull_requests_user
`;

/**
 * This is the list of all tables imported by Airbyte by default when no tables
 * are explicitly provided to the plugin.
 *
 * This is not consumed anywhere, but is useful for referencing, and if you'd
 * like to extend or modify the code, you can choose tables from here to include.
 */
export const allGitHubTableNames = `_airbyte_raw_assignees
_airbyte_raw_branches
_airbyte_raw_collaborators
_airbyte_raw_comments
_airbyte_raw_commit_comment_reactions
_airbyte_raw_commit_comments
_airbyte_raw_commits
_airbyte_raw_deployments
_airbyte_raw_events
_airbyte_raw_issue_comment_reactions
_airbyte_raw_issue_events
_airbyte_raw_issue_labels
_airbyte_raw_issue_milestones
_airbyte_raw_issue_reactions
_airbyte_raw_issues
_airbyte_raw_organizations
_airbyte_raw_project_cards
_airbyte_raw_project_columns
_airbyte_raw_projects
_airbyte_raw_pull_request_comment_reactions
_airbyte_raw_pull_request_commits
_airbyte_raw_pull_request_stats
_airbyte_raw_pull_requests
_airbyte_raw_releases
_airbyte_raw_repositories
_airbyte_raw_review_comments
_airbyte_raw_reviews
_airbyte_raw_stargazers
_airbyte_raw_tags
_airbyte_raw_team_members
_airbyte_raw_team_memberships
_airbyte_raw_teams
_airbyte_raw_users
_airbyte_raw_workflow_jobs
_airbyte_raw_workflow_runs
_airbyte_raw_workflows
_sg_ingestion_state
assignees
branches
branches_commit
branches_protection
branches_protection_required_status_checks
collaborators
collaborators_permissions
comments
comments_user
commit_comment_reactions
commit_comment_reactions_user
commit_comments
commit_comments_user
commits
commits_author
commits_commit
commits_commit_author
commits_commit_committer
commits_commit_tree
commits_commit_verification
commits_committer
commits_parents
deployments
deployments_creator
events
events_actor
events_org
events_repo
issue_comment_reactions
issue_comment_reactions_user
issue_events
issue_events_actor
issue_events_issue
issue_events_issue_user
issue_labels
issue_milestones
issue_milestones_creator
issue_reactions
issue_reactions_user
issues
issues_assignee
issues_assignees
issues_labels
issues_milestone
issues_milestone_creator
issues_pull_request
issues_user
organizations
organizations_plan
project_cards
project_cards_creator
project_columns
projects
projects_creator
pull_request_comment_reactions
pull_request_comment_reactions_user
pull_request_commits
pull_request_commits_author
pull_request_commits_commit
pull_request_commits_commit_author
pull_request_commits_commit_committer
pull_request_commits_commit_tree
pull_request_commits_commit_verification
pull_request_commits_committer
pull_request_commits_parents
pull_request_stats
pull_request_stats_merged_by
pull_requests
pull_requests__links
pull_requests__links_comments
pull_requests__links_commits
pull_requests__links_html
pull_requests__links_issue
pull_requests__links_review_comment
pull_requests__links_review_comments
pull_requests__links_self
pull_requests__links_statuses
pull_requests_assignee
pull_requests_assignees
pull_requests_auto_merge
pull_requests_auto_merge_enabled_by
pull_requests_base
pull_requests_head
pull_requests_labels
pull_requests_milestone
pull_requests_milestone_creator
pull_requests_requested_reviewers
pull_requests_requested_teams
pull_requests_user
releases
releases_assets
releases_author
repositories
repositories_license
repositories_owner
repositories_permissions
review_comments
review_comments__links
review_comments__links_html
review_comments__links_pull_request
review_comments__links_self
review_comments_user
reviews
reviews__links
reviews__links_html
reviews__links_pull_request
reviews_user
stargazers
stargazers_user
tags
tags_commit
team_members
team_memberships
teams
users
workflow_jobs
workflow_jobs_steps
workflow_runs
workflow_runs_head_commit
workflow_runs_head_commit_author
workflow_runs_head_commit_committer
workflow_runs_head_repository
workflow_runs_head_repository_owner
workflow_runs_repository
workflow_runs_repository_owner
workflows`;
