import Section from "../datasetProcessor/Section";
import Room from "../datasetProcessor/Room";

export interface InsightFilter {
	doFilter(section: Section | Room): Promise<boolean>
	// this method takes 1 section as input, labels that section true/false for whether to include it in query.
}
